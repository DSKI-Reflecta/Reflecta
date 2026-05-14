from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import case  # for custom ordering

from ...models.goal import GoalCreate, GoalUpdate, GoalPriority
from ..database import GoalModel


def get_goals(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[GoalModel]:
    """Get all goals with pagination,
    ordered by priority (High -> Medium -> Low)"""
    # Order by priority: 'High' first, then 'Medium', then 'Low'
    return db.query(GoalModel).order_by(
        case(
            (GoalModel.priority == GoalPriority.HIGH.value, 1),
            (GoalModel.priority == GoalPriority.MEDIUM.value, 2),
            (GoalModel.priority == GoalPriority.LOW.value, 3),
            else_=4  # Handle any unexpected values
        )
    ).offset(skip).limit(limit).all()


def get_goal(db: Session, goal_id: int) -> Optional[GoalModel]:
    """Get a specific goal by ID"""
    return db.get(GoalModel, goal_id)


def create_goal(db: Session, goal: GoalCreate) -> GoalModel:
    """Create a new goal"""
    db_goal = GoalModel(
        title=goal.title,
        type=goal.type,
        target_date=goal.target_date,
        category=goal.category,
        # Store the string value of the Enum
        priority=goal.priority.value,
        description=goal.description,
        progress=0  # New goals start with 0 progress
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def update_goal(
    db: Session,
    goal_id: int,
    goal_update: GoalUpdate
) -> Optional[GoalModel]:
    """Update a goal"""
    db_goal = get_goal(db, goal_id)
    if db_goal:
        # only include fields that are set in the update
        update_data: dict = goal_update.model_dump(exclude_unset=True)

        # Update the goal with the new data
        for key, value in update_data.items():
            if key == 'priority' and value is not None:
                setattr(db_goal, key, value.value)
            else:
                setattr(db_goal, key, value)

        # Handle the case where targetDate might be None in the update
            if key == 'target_date':
                setattr(db_goal, key, value)

        # Update the updated_at timestamp
        db_goal.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: int) -> bool:
    """Delete a goal"""
    db_goal = get_goal(db, goal_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
