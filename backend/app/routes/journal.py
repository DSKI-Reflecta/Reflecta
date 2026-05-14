"""
API routes for managing journal entries.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.db.crud.journal import (
    create_journal_entry,
    get_journal_entry,
    get_journal_entries,
    update_journal_entry,
    delete_journal_entry
)
from app.models.entry_goal import (
    JournalEntryCreate,
    JournalEntry,
    JournalEntryUpdate
)

router = APIRouter(
    prefix="/journal",
    tags=["journal"],
    responses={404: {"description": "Not found"}},
)


@router.get("/entries/", response_model=List[JournalEntry])
def read_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    entries = get_journal_entries(db, current_user.id, skip=skip, limit=limit)
    return [
        JournalEntry.model_validate(entry, from_attributes=True)
        for entry in entries
    ]


@router.get("/entries/{entry_id}", response_model=JournalEntry)
def read_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = get_journal_entry(db, entry_id, current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.post("/entries/", response_model=JournalEntry)
def create_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = create_journal_entry(db, entry, current_user.id)
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.put("/entries/{entry_id}", response_model=JournalEntry)
def update_entry(
    entry_id: int,
    entry_update: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = update_journal_entry(db, entry_id, entry_update, current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.delete("/entries/{entry_id}", response_model=dict)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    success = delete_journal_entry(db, entry_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": f"Journal entry with id {entry_id} deleted successfully"}
