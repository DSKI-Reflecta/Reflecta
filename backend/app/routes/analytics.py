"""
API routes for retrieving and analyzing journal entry analytics.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.analytics import TsTrends, Averages
from app.services.analytics import AnalyticsService
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
    analytics_service = AnalyticsService(db)
    return analytics_service.calculate_trends(past_days)


def _calculate_stats(entries):
    """Helper function to calculate statistics from a list of entries."""
    num_entries = len(entries)
    if num_entries == 0:
        return {
            "total_entries": 0,
            "longest_streak": 0,
            "average_words": 0,
            "average_mood": 0,
            "average_sleep_quality": 0,
            "average_stress_level": 0,
            "average_social_engagement": 0,
        }

    # Word count
    total_words = sum(len(e.content.split()) for e in entries)
    average_words = total_words / num_entries if num_entries > 0 else 0

    # Averages
    average_mood = sum(
        e.sentiment_level for e in entries if e.sentiment_level is not None) / num_entries
    average_sleep_quality = sum(
        e.sleep_quality for e in entries if e.sleep_quality is not None) / num_entries
    average_stress_level = sum(
        e.stress_level for e in entries if e.stress_level is not None) / num_entries
    average_social_engagement = sum(
        e.social_engagement for e in entries if e.social_engagement is not None) / num_entries

    # Longest streak
    if not entries:
        longest_streak = 0
    else:
        dates = sorted([e.date.date() for e in entries])
        if not dates:
            longest_streak = 0
        else:
            streaks = []
            current_streak = 1
            for i in range(1, len(dates)):
                if (dates[i] - dates[i-1]).days == 1:
                    current_streak += 1
                else:
                    streaks.append(current_streak)
                    current_streak = 1
            streaks.append(current_streak)
            longest_streak = max(streaks) if streaks else 0

    return {
        "total_entries": num_entries,
        "longest_streak": longest_streak,
        "average_words": average_words,
        "average_mood": average_mood,
        "average_sleep_quality": average_sleep_quality,
        "average_stress_level": average_stress_level,
        "average_social_engagement": average_social_engagement,
    }


def _calculate_trend(current, previous):
    """Helper function to calculate the percentage trend."""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return ((current - previous) / previous) * 100


@router.get("/averages/", response_model=Averages)
def get_averages(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Number of past days to include in the average calculation."
    )
) -> Averages:
    """
    Calculates and retrieves average values for sentiment, sleep, stress, and
    social engagement from journal entries over specified number of past days.
    """
    print("Fetching averages data...")
    analytics_service = AnalyticsService(db)
    return analytics_service.calculate_averages(past_days)


@router.get("/correlations/")
def get_correlations(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Num of past days to consider for correlation analysis.")
):
    """
    Calculates and retrieves correlations between state tracking fields.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider for the analysis.

    Returns:
        dict: Dictionary containing correlation coefficients between metrics.
    """
    analytics_service = AnalyticsService(db)
    return analytics_service.calculate_correlations(past_days)


@router.get("/weekly-patterns/")
def get_weekly_patterns(
    db: Session = Depends(get_db),
    past_days: int = Query(
        30,
        ge=1,
        description="Num of past days to consider for weekly analysis.")
):
    """
    Shows average values per weekday for each metric.

    Args:
        db (Session): The database session dependency.
        past_days (int): The number of past days to consider for the analysis.

    Returns:
        dict: Dictionary containing average values per weekday for each metric.
    """
    analytics_service = AnalyticsService(db)
    return analytics_service.calculate_weekly_patterns(past_days)


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
    analytics_service = AnalyticsService(db)
    entry_details = analytics_service.prepare_summary_data(from_date, to_date)

    if not entry_details:
        return {"summary": "No journal entries found for the specified period."}

    summary = summarize_journal_entries("\n".join(entry_details))
    return {"summary": summary}
