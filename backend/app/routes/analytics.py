"""
API routes for retrieving and analyzing journal entry analytics.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.crud.journal import get_journal_entries
from app.models.analytics import TsTrends, Averages
from app.services.gemini_agent import summarize_journal_entries


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/trends/", response_model=TsTrends)
def get_trends(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Number of past days to include in the trend analysis.")
) -> TsTrends:
    """
    Retrieves time series data for sentiment, sleep, stress, and social
    engagement from journal entries over a specified number of past days.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider
        for the trend analysis.

    Returns:
        TsTrends: An object containing lists of dates
        and corresponding metric values.
    """
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    return TsTrends(
        dates=[e.date.strftime("%Y-%m-%d") for e in entries],
        sentiment=[e.sentiment_level for e in entries],
        sleep=[e.sleep_quality for e in entries],
        stress=[e.stress_level for e in entries],
        social=[e.social_engagement for e in entries],
    )


@router.get("/averages/", response_model=Averages)
def get_averages(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Number of past days to include "
        "in the average calculation.")
) -> Averages:
    """
    Calculates and retrieves average values for sentiment, sleep, stress, and
    social engagement from journal entries over specified number of past days.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider
        for the average calculation.

    Returns:
        Averages: An object containing the average values for each metric.
    """
    print("Fetching averages data...")
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
    entries = get_journal_entries(db, from_date=cutoff_date)

    # Calculate averages
    # handling cases where lists are empty to avoid zero division
    num_entries = len(entries)
    sentiment_avg = sum(e.sentiment_level for e in entries if e.sentiment_level is not None) / \
        num_entries if num_entries > 0 else 0.0
    sleep_avg = sum(e.sleep_quality for e in entries if e.sleep_quality is not None) / \
        num_entries if num_entries > 0 else 0.0
    stress_avg = sum(e.stress_level for e in entries if e.stress_level is not None) / \
        num_entries if num_entries > 0 else 0.0
    social_avg = sum(e.social_engagement for e in entries if e.social_engagement is not None) / \
        num_entries if num_entries > 0 else 0.0

    return Averages(
        sentiment=sentiment_avg,
        sleep=sleep_avg,
        stress=stress_avg,
        social=social_avg,
    )


@router.get("/correlations/")
def get_correlations(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Num of past days to consider for correlation analysis.")
):
    """
    Placeholder endpoint to calculate and retrieve
    correlations between state tracking fields.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider for the analysis.

    Returns:
        None: Currently returns None.
    """
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
def get_weekly_patterns(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Num of past days to consider for weekly analysis.")
):
    """
    Placeholder endpoint to show average values per weekday.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider for the analysis.

    Returns:
        None: Currently returns None.
    """
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
        weekday_data["social_engagement"][weekday].append(
            entry.social_engagement)

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
def generate_summary(
    db: Session = Depends(get_db),
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
):
    """
    Generates a summary of journal entries for a specified period.

    Args:
        db (Session): The database session dependency.
        from_date (Optional[datetime]): The start date of the period.
        to_date (Optional[datetime]): The end date of the period.

    Returns:
        dict: A dictionary containing the summary.
    """
    if from_date is None:
        from_date = datetime.now(timezone.utc) - timedelta(days=7)
    if to_date is None:
        to_date = datetime.now(timezone.utc)

    entries = get_journal_entries(db, from_date=from_date, to_date=to_date)
    if not entries:
        return {"summary": "No journal entries found for the specified period."}

    entry_content = "\n".join([entry.content for entry in entries])
    summary = summarize_journal_entries(entry_content)

    return {"summary": summary}
