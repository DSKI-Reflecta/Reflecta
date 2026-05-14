from sqlalchemy.orm import Session
from datetime import datetime
import json
from typing import List, Optional

from ..models.entry import JournalEntryCreate, JournalEntryUpdate
from .database import JournalEntryModel


def create_journal_entry(db: Session, entry: JournalEntryCreate) -> JournalEntryModel:
    db_entry = JournalEntryModel(
        content=entry.content,
        sentiment_level=entry.sentiment_level,
        sleep_quality=entry.sleep_quality,
        stress_level=entry.stress_level,
        social_engagement=entry.social_engagement
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_journal_entry(db: Session, entry_id: int) -> Optional[JournalEntryModel]:
    return db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()


def get_journal_entries(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[JournalEntryModel]:
    return db.query(JournalEntryModel).order_by(
        JournalEntryModel.created_at.desc()
    ).offset(skip).limit(limit).all()


def update_journal_entry(
    db: Session, 
    entry_id: int, 
    entry_update: JournalEntryUpdate
) -> Optional[JournalEntryModel]:
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        update_data = entry_update.dict(exclude_unset=True)

        # Update the entry with the new data
        for key, value in update_data.items():
            setattr(db_entry, key, value)

        # Update the updated_at timestamp
        db_entry.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_entry)
    return db_entry


def delete_journal_entry(db: Session, entry_id: int) -> bool:
    db_entry = get_journal_entry(db, entry_id)
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False


def update_entry_analysis(
    db: Session,
    entry_id: int,
    formatted_content: Optional[str] = None,
    activities: Optional[List[str]] = None,
    sentiment_analysis: Optional[str] = None,
    keywords: Optional[List[str]] = None
) -> Optional[JournalEntryModel]:
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