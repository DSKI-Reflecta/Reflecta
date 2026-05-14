"""
CRUD operations for goals.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload

from app.db.database import GoalModel
from app.db.crud.utils import get_recent_entries
from app.models.entry_goal import GoalCreate, GoalUpdate, GoalPriority


def get_goals(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    max_entries_per_goal: int = 5
) -> List[GoalModel]:
    """
    Retrieves a list of goals with pagination, ordered by priority,
    and filters to keep only the most recent journal entries for each goal.

    Args:
        db (Session): The database session.
        skip (int): The number of goals to skip (for pagination).
        limit (int): The maximum number of goals to return (for pagination).
        max_entries_per_goal (int): The maximum number of recent journal entries to include per goal.

    Returns:
        List[GoalModel]: A list of goal SQLAlchemy models with filtered journal entries.
    """
    goals_with_entries = (
        db.query(GoalModel)
        .options(joinedload(GoalModel.journal_entries))
        .order_by(
            case(
                (GoalModel.priority == GoalPriority.HIGH.value, 1),
                (GoalModel.priority == GoalPriority.MEDIUM.value, 2),
                (GoalModel.priority == GoalPriority.LOW.value, 3),
                else_=4
            )
        ).offset(skip)
        .limit(limit)
        .all()
    )
    return get_recent_entries(
        goals_with_entries,
        max_entries_per_goal
    )


def get_goal(
        db: Session,
        goal_id: int,
        max_entries_per_goal: int = 5
) -> Optional[GoalModel]:
    """
    Retrieves a specific goal by ID with its associated journal entries.

    Args:
        db (Session): The database session.
        goal_id (int): The ID of the goal to retrieve.
        max_entries_per_goal (int): The maximum number of recent journal entries to include for the goal.

    Returns:
        Optional[GoalModel]: The goal SQLAlchemy model if found, otherwise None.
    """
    goal = (
        db.query(GoalModel)
        .options(joinedload(GoalModel.journal_entries))
        .filter(GoalModel.id == goal_id)
        .one_or_none()
    )
    if goal:
        # get_recent_entries expects a list of goals, so wrap it
        filtered_goal_list = get_recent_entries([goal], max_entries_per_goal)
        return filtered_goal_list[0]
    return None


def create_goal(db: Session, goal: GoalCreate) -> GoalModel:
    """
    Creates a new goal.

    Args:
        db (Session): The database session.
        goal (GoalCreate): The Pydantic model containing the new goal data.

    Returns:
        GoalModel: The newly created goal SQLAlchemy model.
    """
    db_goal = GoalModel(
        title=goal.title,
        type=goal.type,
        target_date=goal.target_date,
        category=goal.category,
        priority=goal.priority.value,
        description=goal.description,
        progress=0
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
    """
    Updates an existing goal.

    Args:
        db (Session): The database session.
        goal_id (int): The ID of the goal to update.
        goal_update (GoalUpdate): The Pydantic model containing the update data.

    Returns:
        Optional[GoalModel]: The updated goal SQLAlchemy model if found, otherwise None.
    """
    db_goal = get_goal(db, goal_id)
    if db_goal:
        update_data: dict = goal_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key == 'priority' and value is not None:
                setattr(db_goal, key, value.value)
            else:
                setattr(db_goal, key, value)

        db_goal.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: int) -> bool:
    """
    Deletes a goal by its ID.

    Args:
        db (Session): The database session.
        goal_id (int): The ID of the goal to delete.

    Returns:
        bool: True if the goal was deleted, False otherwise.
    """
    db_goal = get_goal(db, goal_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
