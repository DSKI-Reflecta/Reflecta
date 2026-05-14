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
