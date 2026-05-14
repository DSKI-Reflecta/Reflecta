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
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    max_entries_per_goal: int = 5
) -> List[GoalModel]:
    goals_with_entries = (
        db.query(GoalModel)
        .filter(GoalModel.user_id == user_id)
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
        user_id: int,
        max_entries_per_goal: int = 5
) -> Optional[GoalModel]:
    goal = (
        db.query(GoalModel)
        .filter(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        .options(joinedload(GoalModel.journal_entries))
        .one_or_none()
    )
    if goal:
        filtered_goal_list = get_recent_entries([goal], max_entries_per_goal)
        return filtered_goal_list[0]
    return None


def create_goal(db: Session, goal: GoalCreate, user_id: int) -> GoalModel:
    db_goal = GoalModel(
        user_id=user_id,
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
    goal_update: GoalUpdate,
    user_id: int,
) -> Optional[GoalModel]:
    db_goal = get_goal(db, goal_id, user_id)
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


def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    db_goal = get_goal(db, goal_id, user_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
