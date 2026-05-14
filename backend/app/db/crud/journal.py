from datetime import datetime, timezone
import json
from typing import List, Optional
from sqlalchemy.orm import Session

from ...models.entry import JournalEntryCreate, JournalEntryUpdate
from ..database import JournalEntryModel
from ...services.gemini_agent import format_journal_content


# --- Journal Entry CRUD  ---

def get_journal_entries(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[JournalEntryModel]:
    """Get all journal entries with pagination.
    Order by date (descending) and created_at (descending)."""
    return db.query(JournalEntryModel).order_by(
        JournalEntryModel.date.desc(),
        JournalEntryModel.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_journal_entry(db: Session,
                      entry_id: int) -> Optional[JournalEntryModel]:
    """Get a specific journal entry by ID"""
    return db.get(JournalEntryModel, entry_id)


def create_journal_entry(db: Session,
                         entry: JournalEntryCreate
                         ) -> JournalEntryModel:
    """Create a new journal entry with AI-formatted content"""
    # Format the content using the formatter service
    formatted_content = format_journal_content(entry.content)

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
        formatted_content=formatted_content
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
            if key in ['sentiment_level', 'sleep_quality', 'stress_level',
                       'social_engagement'] and value is not None:
                setattr(db_entry, key, value.value)
            else:
                setattr(db_entry, key, value)

        # Format the content using the formatter service if provided
        if entry_update.content:
            formatted = format_journal_content(entry_update.content)
            db_entry.formatted_content = formatted

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


# --- AI Analysis CRUD ---

def update_entry_analysis(
    db: Session,
    entry_id: int,
    formatted_content: Optional[str] = None,
    activities: Optional[List[str]] = None,
    sentiment_analysis: Optional[str] = None,
    keywords: Optional[List[str]] = None
) -> Optional[JournalEntryModel]:
    """Update AI analysis fields for a journal entry"""
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        if formatted_content is not None:
            db_entry.formatted_content = formatted_content

        if activities is not None:
            db_entry.activities = json.dumps(activities)

        if sentiment_analysis is not None:
            db_entry.sentiment_analysis = sentiment_analysis

        if keywords is not None:
            db_entry.keywords = json.dumps(keywords)

        db.commit()
        db.refresh(db_entry)
    return db_entry
