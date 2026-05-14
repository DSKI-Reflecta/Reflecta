from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import json

from ..db.database import get_db
from ..db.crud.journal import (
    create_journal_entry,
    get_journal_entry,
    get_journal_entries,
    update_journal_entry,
    delete_journal_entry
)
# Import updated models
from ..models.entry import JournalEntryCreate, JournalEntry, JournalEntryUpdate

router = APIRouter(
    prefix="/journal",
    tags=["journal"],  # for swagger UI
    responses={404: {"description": "Not found"}},  # default response
)


@router.get("/entries/", response_model=List[JournalEntry])
def read_entries(
    skip: int = Query(0, ge=0,
                      description="Number of items to skip (where to start)"),
    limit: int = Query(100, ge=1, le=100,
                       description="Max number of items to return"),
    db: Session = Depends(get_db)
):
    """Get all journal entries with pagination"""
    # Convert the activities and keywords from JSON strings to lists
    entries = get_journal_entries(db, skip=skip, limit=limit)
    results = []
    for entry in entries:
        result = JournalEntry.from_orm(entry)
        if entry.activities:
            result.activities = json.loads(entry.activities)
        if entry.keywords:
            result.keywords = json.loads(entry.keywords)
        results.append(result)
    return results


@router.get("/entries/{entry_id}", response_model=JournalEntry)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific journal entry by ID"""
    db_entry = get_journal_entry(db, entry_id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # Convert the activities and keywords from JSON strings to lists
    result = JournalEntry.from_orm(db_entry)
    if db_entry.activities:
        result.activities = json.loads(db_entry.activities)
    if db_entry.keywords:
        result.keywords = json.loads(db_entry.keywords)
    return result


@router.post("/entries/", response_model=JournalEntry)
def create_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    """Create a new journal entry"""
    # create_journal_entry now expects and handles title and date
    db_entry = create_journal_entry(db, entry)

    # Convert the activities and keywords from JSON strings
    result = JournalEntry.from_orm(db_entry)
    if db_entry.activities:
        result.activities = json.loads(db_entry.activities)
    if db_entry.keywords:
        result.keywords = json.loads(db_entry.keywords)
    return result


@router.put("/entries/{entry_id}", response_model=JournalEntry)
def update_entry(
    entry_id: int,
    entry_update: JournalEntryUpdate,
    db: Session = Depends(get_db)
):
    """Update a journal entry"""
    db_entry = update_journal_entry(db, entry_id, entry_update)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # Convert the activities and keywords from JSON strings to lists
    result = JournalEntry.from_orm(db_entry)
    if db_entry.activities:
        result.activities = json.loads(db_entry.activities)
    if db_entry.keywords:
        result.keywords = json.loads(db_entry.keywords)
    return result


@router.delete("/entries/{entry_id}", response_model=bool)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a journal entry"""
    success = delete_journal_entry(db, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return success
