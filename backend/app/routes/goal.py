"""
API routes for managing goals.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.db.crud.goal import (
    create_goal,
    get_goal,
    get_goals,
    update_goal,
    delete_goal
)
from app.db.crud.journal import get_journal_entries
from app.models.entry_goal import GoalCreate, Goal, GoalUpdate
from app.models.chat_agent import EnhanceDescriptionRequest
from app.services.gemini_agent import (
    recommend_goals,
    RecommendedGoal,
    enhance_goal_description,
)


router = APIRouter(
    prefix="/goals",
    tags=["goals"],
    responses={404: {"description": "Goal not found"}},
)


@router.get("/", response_model=List[Goal])
def read_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return get_goals(db, current_user.id, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=Goal)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_goal = get_goal(db, goal_id, current_user.id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.post("/", response_model=Goal)
def create_goal_route(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return create_goal(db, goal, current_user.id)


@router.put("/{goal_id}", response_model=Goal)
def update_goal_route(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_goal = update_goal(db, goal_id, goal_update, current_user.id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.delete("/{goal_id}", response_model=dict)
def delete_goal_route(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    success = delete_goal(db, goal_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": f"Goal with id {goal_id} deleted successfully"}


@router.post("/recommend", response_model=List[RecommendedGoal])
def recommend_new_goals(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    entries = get_journal_entries(db, current_user.id)
    if not entries:
        return []
    entry_content = "\n\n".join([entry.content for entry in entries])
    recommendations = recommend_goals(entry_content, db, current_user.id)
    return recommendations


@router.post("/enhance-description", response_model=str)
def enhance_description_endpoint(
    request: EnhanceDescriptionRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    enhanced_description = enhance_goal_description(
        title=request.title,
        description=request.description,
        db=db,
        user_id=current_user.id,
    )
    return enhanced_description
