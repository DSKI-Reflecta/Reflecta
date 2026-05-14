"""
Utility functions for database operations related to goals and journal entries.
"""

from typing import List

from sqlalchemy.orm import Session

from app.db.database import GoalModel
from app.models.entry_goal import Goal


def get_recent_entries(
    goals: List[Goal],
    max_entries_per_goal: int = 3
) -> List[Goal]:
    """
    Filters journal entries for each goal, keeping only the most recent ones.

    Args:
        goals (List[Goal]): A list of Goal Pydantic models, potentially containing journal entries.
        max_entries_per_goal (int): The maximum number of recent entries to keep for each goal.

    Returns:
        List[Goal]: The list of Goal Pydantic models with filtered journal entries.
    """
    for goal in goals:
        if goal.journal_entries:
            sorted_entries = sorted(goal.journal_entries,
                                    key=lambda entry: entry.date,
                                    reverse=True)
            goal.journal_entries = sorted_entries[:max_entries_per_goal]
    return goals


def get_goal_info(db: Session) -> List[dict]:
    """
    Retrieves basic information (id, title, description) for all goals from the database.

    Args:
        db (Session): The database session.

    Returns:
        List[dict]: A list of dictionaries, each containing 'id', 'title', and 'description' of a goal.
    """
    goal_info = [
        {"id": goal.id, "title": goal.title, "description": goal.description}
        for goal in db.query(GoalModel).all()
    ]
    return goal_info


def get_goals(db: Session, goal_ids: Optional[List[int]] = None) -> List[GoalModel]:
    """
    Retrieves a list of Goal SQLAlchemy models by their IDs.

    Args:
        db (Session): The database session.
        goal_ids (Optional[List[int]]): A list of goal IDs to retrieve. If None, an empty list is returned.

    Returns:
        List[GoalModel]: A list of Goal SQLAlchemy models.
    """
    return db.query(GoalModel).filter(
        GoalModel.id.in_(goal_ids)
    ).all() if goal_ids else []
