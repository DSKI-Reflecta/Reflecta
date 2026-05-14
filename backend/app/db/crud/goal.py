from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import case  # for custom ordering

from ...models.entry_goal import GoalCreate, GoalUpdate, GoalPriority
from ..database import GoalModel
from .utils import get_recent_entries


def get_goals(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    max_entries_per_goal: int = 5
) -> List[GoalModel]:
    """Get all goals with pagination,
    ordered by priority (High -> Medium -> Low)
    and filter to keep only the most recent journal entries."""
    # Order by priority: 'High' first, then 'Medium', then 'Low'
    goals_with_entries = (
        db.query(GoalModel)
        .options(joinedload(GoalModel.journal_entries))
        .order_by(
            case(
                (GoalModel.priority == GoalPriority.HIGH.value, 1),
                (GoalModel.priority == GoalPriority.MEDIUM.value, 2),
                (GoalModel.priority == GoalPriority.LOW.value, 3),
                else_=4  # Handle any unexpected values
            )
        ).offset(skip)
        .limit(limit)
        .all()
    )
    # Filter out journal entries to keep only the most recent ones
    return get_recent_entries(
        goals_with_entries,
        max_entries_per_goal
    )


def get_goal(
        db: Session,
        goal_id: int,
        max_entries_per_goal: int = 5
) -> Optional[GoalModel]:
    """Get a specific goal by ID with its journal entries"""
    # Load the goal with joined journal entries eagerly
    goal = [(
        db.query(GoalModel)
        .options(joinedload(GoalModel.journal_entries))
        .filter(GoalModel.id == goal_id)
        .one_or_none()
    )]
    # Filter out journal entries to keep only the most recent ones
    goal = get_recent_entries(
        goal,
        max_entries_per_goal
    )
    return goal[0] if goal else None


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
