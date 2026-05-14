"""
API routes for analytics.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.models.analytics import TsTrends, Averages
from app.services.analytics import AnalyticsService
from app.services.gemini_agent import summarize_journal_entries
from app.utils.analytics import parse_period_to_days


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/trends/", response_model=TsTrends)
def get_trends(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_trends(past_days)


@router.get("/stats/", response_model=Averages)
def get_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_averages(past_days)


@router.get("/correlations/")
def get_correlations(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_correlations(past_days)


@router.get("/summary/")
def generate_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    to_date = datetime.now()
    from_date = to_date - timedelta(days=past_days)

    analytics_service = AnalyticsService(db, current_user.id)
    entry_details = analytics_service.prepare_summary_data(from_date, to_date)

    if not entry_details:
        return {"summary": "No journal entries found for the specified period."}

    summary = summarize_journal_entries("\n".join(entry_details))
    return {"summary": summary}
