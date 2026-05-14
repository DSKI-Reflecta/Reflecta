from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from ..db.database import get_db
from app.db.crud.journal import get_journal_entries
from app.models.analytics import TsTrends, Averages

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]  # for swagger UI
)


@router.get("/trends/", response_model=TsTrends)
def get_trends(db: Session = Depends(get_db), past_days: int = 30):
    """Get time series data of journal entries over the past 30 days."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    return {
        "dates": [e.date.strftime("%Y-%m-%d") for e in entries],
        "sentiment": [e.sentiment_level for e in entries],
        "sleep": [e.sleep_quality for e in entries],
        "stress": [e.stress_level for e in entries],
        "social": [e.social_engagement for e in entries],
    }


@router.get("/averages/", response_model=Averages)
def get_averages(db: Session = Depends(get_db), past_days: int = 30):
    """Get average values of journal entries over the past 30 days."""
    print("Fetching averages data...")
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    return {
        "sentiment": sum(e.sentiment_level for e in entries) / len(entries),
        "sleep": sum(e.sleep_quality for e in entries) / len(entries),
        "stress": sum(e.stress_level for e in entries) / len(entries),
        "social": sum(e.social_engagement for e in entries) / len(entries),
    }


@router.get("/correlations/")
def get_correlations(db: Session = Depends(get_db)):
    """Get correlations of state tracking fields."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
    get_journal_entries(db, from_date=cutoff_date)

    # Calculate correlations

    return None
