"""
API routes for managing goals, including CRUD operations
and AI-driven recommendations.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.crud.goal import (
    create_goal,
    get_goal,
    get_goals,
    update_goal,
    delete_goal
)
from app.db.crud.journal import get_journal_entries
from app.models.entry_goal import GoalCreate, Goal, GoalUpdate
from app.services.gemini_agent import (
    recommend_goals,
    RecommendedGoal,
    enhance_goal_description,
)


class EnhanceDescriptionRequest(BaseModel):
    """
    Request model for enhancing a goal description.
    """
    title: str
    description: Optional[str] = None


router = APIRouter(
    prefix="/goals",
    tags=["goals"],
    responses={404: {"description": "Goal not found"}},
)


@router.get("/", response_model=List[Goal])
def read_goals(
    skip: int = Query(
        0, ge=0, description="Number of items to skip (for pagination)"),
    limit: int = Query(100, ge=1, le=100,
                       description="Max number of items to return"),
    db: Session = Depends(get_db)
) -> List[Goal]:
    """
    Retrieves a list of goals with pagination.

    Args:
        skip (int): The number of goals to skip.
        limit (int): The maximum number of goals to return.
        db (Session): The database session dependency.

    Returns:
        List[Goal]: A list of goals.
    """
    return get_goals(db, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=Goal)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db)
) -> Goal:
    """
    Retrieves a specific goal by its ID.

    Args:
        goal_id (int): The ID of the goal to retrieve.
        db (Session): The database session dependency.

    Raises:
        HTTPException: If the goal is not found.

    Returns:
        Goal: The retrieved goal.
    """
    db_goal = get_goal(db, goal_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.post("/", response_model=Goal)
def create_goal_route(
    goal: GoalCreate,
    db: Session = Depends(get_db)
) -> Goal:
    """
    Creates a new goal.

    Args:
        goal (GoalCreate): The goal data to create.
        db (Session): The database session dependency.

    Returns:
        Goal: The newly created goal.
    """
    return create_goal(db, goal)


@router.put("/{goal_id}", response_model=Goal)
def update_goal_route(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db)
) -> Goal:
    """
    Updates an existing goal.

    Args:
        goal_id (int): The ID of the goal to update.
        goal_update (GoalUpdate): The updated goal data.
        db (Session): The database session dependency.

    Raises:
        HTTPException: If the goal is not found.

    Returns:
        Goal: The updated goal.
    """
    db_goal = update_goal(db, goal_id, goal_update)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.delete("/{goal_id}", response_model=dict)
def delete_goal_route(
    goal_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """
    Deletes a goal by its ID.

    Args:
        goal_id (int): The ID of the goal to delete.
        db (Session): The database session dependency.

    Raises:
        HTTPException: If the goal is not found.

    Returns:
        dict: A confirmation message.
    """
    success = delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": f"Goal with id {goal_id} deleted successfully"}


@router.post("/recommend", response_model=List[RecommendedGoal])
def recommend_new_goals(
    db: Session = Depends(get_db)
) -> List[RecommendedGoal]:
    """
    Recommends new goals based on existing journal entries.

    Args:
        db (Session): The database session dependency.

    Returns:
        List[RecommendedGoal]: A list of recommended goals.
    """
    entries = get_journal_entries(db)
    if not entries:
        return []

    entry_content = "\n\n".join([entry.content for entry in entries])

    recommendations = recommend_goals(entry_content)
    return recommendations


@router.post("/enhance-description", response_model=str)
def enhance_description_endpoint(
    request: EnhanceDescriptionRequest,
    db: Session = Depends(get_db)
) -> str:
    """
    Enhances or generates a goal description using AI.

    Args:
        request (EnhanceDescriptionRequest): The request containing
        the goal title and optional description.
        db (Session): The database session dependency.

    Returns:
        str: The enhanced or generated goal description.
    """
    enhanced_description = enhance_goal_description(
        title=request.title,
        description=request.description
    )
    return enhanced_description
