from typing import List
from sqlalchemy.orm import Session
from ...models.entry_goal import Goal
from ..database import GoalModel


def get_recent_entries(
    goals: List[Goal],
    max_entries_per_goal: int = 3
):
    # For each goal, filter to keep only the most recent entries
    for goal in goals:
        if goal.journal_entries:
            # Sort entries by date (newest first)
            sorted_entries = sorted(goal.journal_entries,
                                    key=lambda entry: entry.date,
                                    reverse=True)
            # Keep only the max number specified
            goal.journal_entries = sorted_entries[:max_entries_per_goal]

    return goals


def get_goal_info(
        db: Session,
) -> List[dict]:
    """Get all goal information from the database"""
    # Get all goal information from the database
    goal_info = [
        {"id": goal.id, "title": goal.title, "description": goal.description}
        for goal in db.query(GoalModel).all()
    ]
    return goal_info


def get_goals(
        db: Session,
        goal_ids: List[int] = None
) -> List[GoalModel]:
    """Get goals by their IDs"""
    return db.query(GoalModel).filter(
        GoalModel.id.in_(goal_ids)
    ).all() if goal_ids else []
