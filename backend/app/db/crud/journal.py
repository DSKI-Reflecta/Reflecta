from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from ...models.entry_goal import JournalEntryCreate, JournalEntryUpdate
from ..database import JournalEntryModel
from ...services.gemini_agent import analyze_entry
from .utils import get_goal_info, get_goals


def get_journal_entries(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    from_date: Optional[datetime] = None,
) -> List[JournalEntryModel]:
    """Get all journal entries with optional filter
    and pagination."""
    query = db.query(JournalEntryModel)

    # Filter by date if provided
    if from_date:
        query = query.filter(JournalEntryModel.date >= from_date)

    return query.order_by(
        JournalEntryModel.date.desc(),
        JournalEntryModel.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_journal_entry(db: Session,
                      entry_id: int) -> Optional[JournalEntryModel]:
    # Optional[JournalEntryModel] == Union[JournalEntryModel, None]
    """Get a specific journal entry by ID"""
    return db.get(JournalEntryModel, entry_id)


def create_journal_entry(db: Session,
                         entry: JournalEntryCreate
                         ) -> JournalEntryModel:
    """Create a new journal entry with AI-formatted content"""
    # Get all goal information from the database
    goal_info = get_goal_info(db)
    # Analyze the entry content using the AI service
    formatted_content, activities, sentiments, goal_ids = analyze_entry(
        entry.content, goal_info
    )
    # Get the goals with the specified IDs
    goals = get_goals(db, goal_ids)

    db_entry = JournalEntryModel(
        title=entry.title,
        date=entry.date,  # Pass the date object
        content=entry.content,
        # Explicitly use .value for IntEnum fields to get the integer value
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
    db.refresh(db_entry)  # Refresh instance to get the new ID and timestamp
    return db_entry


def update_journal_entry(
    db: Session,
    entry_id: int,
    entry_update: JournalEntryUpdate
) -> Optional[JournalEntryModel]:
    """Update a journal entry with optional AI formatting"""
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        # only include fields that are set in the update
        update_data: dict = entry_update.model_dump(exclude_unset=True)

        # Update the entry with the new data
        for key, value in update_data.items():
            # Handle IntEnum fields separately to store their integer values
            if key in ['sentiment_level', 'sleep_quality', 'stress_level',
                       'social_engagement'] and value is not None:
                setattr(db_entry, key, value.value)
            else:
                setattr(db_entry, key, value)

        # Update the content and re-analyze if content is provided
        if entry_update.content:
            # Get all goal information from the database
            goal_info = get_goal_info(db)
            # Analyze the entry content using the AI service
            formatted, activities, sentiments, goal_ids = analyze_entry(
                entry_update.content, goal_info
            )
            # Get the goals with the specified IDs
            goals = get_goals(db, goal_ids)

            db_entry.formatted_content = formatted
            db_entry.activities = activities
            db_entry.sentiments = sentiments
            db_entry.goals.clear()  # Clear existing goals
            db_entry.goals.extend(goals)  # Add new goals

        # Update the updated_at timestamp
        db_entry.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_entry)
    return db_entry


def delete_journal_entry(db: Session, entry_id: int) -> bool:
    """Delete a journal entry"""
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False
