from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud.goal import (
    create_goal,
    get_goal,
    get_goals,
    update_goal,
    delete_goal
)
from app.models.entry_goal import GoalCreate, Goal, GoalUpdate
from app.services.gemini_agent import recommend_goals, RecommendedGoal, enhance_goal_description
from app.db.crud.journal import get_journal_entries
from pydantic import BaseModel


class EnhanceDescriptionRequest(BaseModel):
    title: str
    description: Optional[str] = None


router = APIRouter(
    prefix="/goals",  # Prefix for goal endpoints
    tags=["goals"],
    responses={404: {"description": "Goal not found"}},
)


@router.get("/", response_model=List[Goal])
def read_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
) -> List[Goal]:
    """Get all goals with pagination"""
    return get_goals(db, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=Goal)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db)
) -> Goal:
    """Get a specific goal by ID"""
    db_goal = get_goal(db, goal_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.post("/", response_model=Goal)
def create_new_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db)
) -> Goal:
    """Create a new goal"""
    return create_goal(db, goal)


@router.put("/{goal_id}", response_model=Goal)
def update_existing_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db)
) -> Goal:
    """Update a goal"""
    db_goal = update_goal(db, goal_id, goal_update)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.delete("/{goal_id}", response_model=dict)
def delete_existing_goal(
    goal_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """Delete a goal"""
    success = delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message":
            f"Journal entry with id {goal_id} deleted successfully"}


@router.post("/recommend", response_model=List[RecommendedGoal])
def recommend_new_goals(db: Session = Depends(get_db)) -> List[RecommendedGoal]:
    """Recommend new goals based on journal entries"""
    entries = get_journal_entries(db)
    if not entries:
        return []

    # Combine entries into a single string
    entry_content = "\n\n".join([entry.content for entry in entries])

    # Get recommendations from the AI service
    recommendations = recommend_goals(entry_content)
    return recommendations


@router.post("/enhance-description", response_model=str)
def enhance_description_endpoint(
    request: EnhanceDescriptionRequest,
    db: Session = Depends(get_db)
) -> str:
    """Enhance or generate a goal description using AI"""
    enhanced_description = enhance_goal_description(
        title=request.title,
        description=request.description
    )
    return enhanced_description
