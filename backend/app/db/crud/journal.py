"""
CRUD operations for journal entries.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.database import JournalEntryModel
from app.db.crud.utils import get_goal_info, get_goals
from app.models.entry_goal import JournalEntryCreate, JournalEntryUpdate
from app.services.gemini_agent import analyze_entry


def get_journal_entries(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
) -> List[JournalEntryModel]:
    """
    Retrieves a list of journal entries with optional filtering and pagination.

    Args:
        db (Session): The database session.
        skip (int): The number of entries to skip (for pagination).
        limit (int): The maximum number of entries to return (for pagination).
        from_date (Optional[datetime]): If provided, only entries on or after this date will be returned.
        to_date (Optional[datetime]): If provided, only entries on or before this date will be returned.

    Returns:
        List[JournalEntryModel]: A list of journal entry SQLAlchemy models.
    """
    query = db.query(JournalEntryModel)

    if from_date:
        query = query.filter(JournalEntryModel.date >= from_date)
    if to_date:
        query = query.filter(JournalEntryModel.date <= to_date)

    return query.order_by(
        JournalEntryModel.date.desc(),
        JournalEntryModel.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_journal_entry(db: Session, entry_id: int) -> Optional[JournalEntryModel]:
    """
    Retrieves a specific journal entry by its ID.

    Args:
        db (Session): The database session.
        entry_id (int): The ID of the journal entry to retrieve.

    Returns:
        Optional[JournalEntryModel]: The journal entry SQLAlchemy model if found, otherwise None.
    """
    return db.get(JournalEntryModel, entry_id)


def create_journal_entry(db: Session, entry: JournalEntryCreate) -> JournalEntryModel:
    """
    Creates a new journal entry, including AI-generated analysis and goal association.

    Args:
        db (Session): The database session.
        entry (JournalEntryCreate): The Pydantic model containing the new journal entry data.

    Returns:
        JournalEntryModel: The newly created journal entry SQLAlchemy model.
    """
    goal_info = get_goal_info(db)
    formatted_content, activities, sentiments, goal_ids = analyze_entry(
        entry.content, goal_info
    )
    goals = get_goals(db, goal_ids)

    db_entry = JournalEntryModel(
        title=entry.title,
        date=entry.date,
        content=entry.content,
        sentiment_level=(
            entry.sentiment_level.value
            if entry.sentiment_level is not None
            else None
        ),
        sleep_quality=(
            entry.sleep_quality.value
            if entry.sleep_quality is not None
            else None
        ),
        stress_level=(
            entry.stress_level.value
            if entry.stress_level is not None
            else None
        ),
        social_engagement=(
            entry.social_engagement.value
            if entry.social_engagement is not None
            else None
        ),
        formatted_content=formatted_content,
        activities=activities,
        sentiments=sentiments,
        goals=goals,
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def update_journal_entry(
    db: Session,
    entry_id: int,
    entry_update: JournalEntryUpdate
) -> Optional[JournalEntryModel]:
    """
    Updates an existing journal entry. If content is updated, AI re-analysis is performed.

    Args:
        db (Session): The database session.
        entry_id (int): The ID of the journal entry to update.
        entry_update (JournalEntryUpdate): The Pydantic model containing the update data.

    Returns:
        Optional[JournalEntryModel]: The updated journal entry SQLAlchemy model if found, otherwise None.
    """
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        update_data: dict = entry_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key in ['sentiment_level', 'sleep_quality', 'stress_level',
                       'social_engagement'] and value is not None:
                setattr(db_entry, key, value.value)
            else:
                setattr(db_entry, key, value)

        if entry_update.content:
            goal_info = get_goal_info(db)
            formatted, activities, sentiments, goal_ids = analyze_entry(
                entry_update.content, goal_info
            )
            goals = get_goals(db, goal_ids)

            db_entry.formatted_content = formatted
            db_entry.activities = activities
            db_entry.sentiments = sentiments
            db_entry.goals.clear()
            db_entry.goals.extend(goals)

        db_entry.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_entry)
    return db_entry


def delete_journal_entry(db: Session, entry_id: int) -> bool:
    """
    Deletes a journal entry by its ID.

    Args:
        db (Session): The database session.
        entry_id (int): The ID of the journal entry to delete.

    Returns:
        bool: True if the entry was deleted, False otherwise.
    """
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False
