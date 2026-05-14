from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from ..db.database import get_db
from ..db.crud.journal import get_journal_entries
from ..models.analytics import TsTrends, Averages

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
def get_correlations(db: Session = Depends(get_db), past_days: int = 30):
    """Get correlations of state tracking fields."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    import numpy as np 

    sleep = [e.sleep_quality for e in entries]
    sentiment = [e.sentiment_level for e in entries]
    stress = [e.stress_level for e in entries]
    social = [e.social_engagement for e in entries]

    sleep_sentiment_correlation = np.corrcoef(sleep, sentiment)[0, 1]
    sleep_stress_correlation = np.corrcoef(sleep, stress)[0, 1]
    sleep_social_correlation = np.corrcoef(sleep, social)[0, 1]
    sentiment_stress_correlation = np.corrcoef(sentiment, stress)[0, 1]
    sentiment_social_correlation = np.corrcoef(sentiment, social)[0, 1]
    stress_social_correlation = np.corrcoef(stress, social)[0, 1]


    return {
        "sleep_sentiment_correlation": sleep_sentiment_correlation,
        "sleep_stress_correlation": sleep_stress_correlation,
        "sleep_social_correlation": sleep_social_correlation,
        "sentiment_stress_correlation": sentiment_stress_correlation,
        "sentiment_social_correlation": sentiment_social_correlation,
        "stress_social_correlation": stress_social_correlation
    },


@router.get("/weekly-patterns/")
def get_weekly_patterns(db: Session = Depends(get_db), past_days: int = 30):
    """Show average values per weekday."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    from collections import defaultdict
    import numpy as np
    
    # defaultdict für automatische Listeninitialisierung
    weekday_data = {
        "sleep_quality": defaultdict(list),
        "sentiment_level": defaultdict(list),
        "stress_level": defaultdict(list),
        "social_engagement": defaultdict(list),
    }

    for entry in entries:
        weekday = entry.date.weekday()  # 0 = Mo, 6 = So
        weekday_data["sleep_quality"][weekday].append(entry.sleep_quality)
        weekday_data["sentiment_level"][weekday].append(entry.sentiment_level)
        weekday_data["stress_level"][weekday].append(entry.stress_level)
        weekday_data["social_engagement"][weekday].append(entry.social_engagement)

    # Durchschnitt pro Wochentag berechnen
    averages = {}
    for field, days in weekday_data.items():
        averages[field] = {}
        for weekday in range(7):
            values = days.get(weekday, [])
            averages[field][weekday] = (
                round(float(np.mean(values)), 2) if values else None
            )

    return averages


@router.get("/summary/")
def generate_summary(db: Session = Depends(get_db), past_days: int = 7):
    """Generate a summary of journal entries."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    get_journal_entries(db, from_date=cutoff_date)

    # Generate summary

    return None
