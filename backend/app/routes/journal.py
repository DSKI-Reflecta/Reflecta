from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db.crud.journal import (
    create_journal_entry,
    get_journal_entry,
    get_journal_entries,
    update_journal_entry,
    delete_journal_entry
)
# Import updated models
from app.models.entry_goal import (
    JournalEntryCreate,
    JournalEntry,
    JournalEntryUpdate
)

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
) -> List[JournalEntry]:
    """Get all journal entries with pagination"""
    entries = get_journal_entries(db, skip=skip, limit=limit)
    return [
        JournalEntry.model_validate(entry, from_attributes=True)
        for entry in entries
    ]


@router.get("/entries/{entry_id}", response_model=JournalEntry)
def read_entry(
    entry_id: int,
    db: Session = Depends(get_db)
) -> JournalEntry:
    """Get a specific journal entry by ID"""
    db_entry = get_journal_entry(db, entry_id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.post("/entries/", response_model=JournalEntry)
def create_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db)
) -> JournalEntry:
    """Create a new journal entry"""
    db_entry = create_journal_entry(db, entry)
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.put("/entries/{entry_id}", response_model=JournalEntry)
def update_entry(
    entry_id: int,
    entry_update: JournalEntryUpdate,
    db: Session = Depends(get_db)
) -> JournalEntry:
    """Update a journal entry"""
    db_entry = update_journal_entry(db, entry_id, entry_update)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.delete("/entries/{entry_id}", response_model=dict)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """Delete a journal entry"""
    success = delete_journal_entry(db, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message":
            f"Journal entry with id {entry_id} deleted successfully"}
