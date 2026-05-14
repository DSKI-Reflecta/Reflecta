from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.crud import (
    create_goal,
    get_goal,
    get_goals,
    update_goal,
    delete_goal
)
from ..models.goal import GoalCreate, Goal, GoalUpdate

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
):
    """Get all goals with pagination"""
    return get_goals(db, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=Goal)
def read_goal(goal_id: int, db: Session = Depends(get_db)):
    """Get a specific goal by ID"""
    db_goal = get_goal(db, goal_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.post("/", response_model=Goal)
def create_new_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    """Create a new goal"""
    return create_goal(db, goal)


@router.put("/{goal_id}", response_model=Goal)
def update_existing_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db)
):
    """Update a goal"""
    db_goal = update_goal(db, goal_id, goal_update)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.delete("/{goal_id}", response_model=bool)
def delete_existing_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a goal"""
    success = delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return success
