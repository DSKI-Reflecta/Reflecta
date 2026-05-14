"""
API routes for analytics.
"""

import json
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, AnalyticsCacheModel, SessionLocal, UserModel
from app.auth.dependencies import get_current_user
from app.models.analytics import TsTrends, Averages
from app.services.analytics import AnalyticsService
from app.services.gemini_agent import summarize_journal_entries, generate_correlation_insights
from app.utils.analytics import parse_period_to_days

logger = logging.getLogger(__name__)

CACHE_TTL_HOURS = 24

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


def _get_cache(db: Session, user_id: int, period: str, cache_type: str):
    entry = db.query(AnalyticsCacheModel).filter(
        AnalyticsCacheModel.user_id == user_id,
        AnalyticsCacheModel.period == period,
        AnalyticsCacheModel.cache_type == cache_type,
    ).first()
    if not entry:
        return None
    age = datetime.now(timezone.utc) - entry.generated_at.replace(tzinfo=timezone.utc)
    if age > timedelta(hours=CACHE_TTL_HOURS):
        return None
    return entry.content


def _set_cache(user_id: int, period: str, cache_type: str, content: str):
    db = SessionLocal()
    try:
        entry = db.query(AnalyticsCacheModel).filter(
            AnalyticsCacheModel.user_id == user_id,
            AnalyticsCacheModel.period == period,
            AnalyticsCacheModel.cache_type == cache_type,
        ).first()
        if entry:
            entry.content = content
            entry.generated_at = datetime.now(timezone.utc)
        else:
            entry = AnalyticsCacheModel(
                user_id=user_id,
                period=period,
                cache_type=cache_type,
                content=content,
                generated_at=datetime.now(timezone.utc),
            )
            db.add(entry)
        db.commit()
    finally:
        db.close()


def _generate_summary_background(user_id: int, period: str):
    db = SessionLocal()
    try:
        past_days = parse_period_to_days(period)
        to_date = datetime.now()
        from_date = to_date - timedelta(days=past_days)
        analytics_service = AnalyticsService(db, user_id)
        entry_details = analytics_service.prepare_summary_data(from_date, to_date)
        if not entry_details:
            return
        summary = summarize_journal_entries("\n".join(entry_details), db, user_id)
        _set_cache(user_id, period, "summary", summary)
    except Exception as e:
        logger.error(f"Background summary generation failed: {e}")
    finally:
        db.close()


def _generate_correlations_background(user_id: int, period: str):
    db = SessionLocal()
    try:
        past_days = parse_period_to_days(period)
        analytics_service = AnalyticsService(db, user_id)
        result = analytics_service.calculate_correlations_data(past_days)
        if not result:
            return
        top_correlations = result["strongest_correlations"]
        for key, value in top_correlations.items():
            chart_data = json.dumps({
                "x_label": value["x_label"],
                "y_label": value["y_label"],
                "correlation": value["correlation"],
                "data": value["data"],
            })
            insights = generate_correlation_insights(chart_data, db, user_id)
            top_correlations[key]["insights"] = insights
        _set_cache(user_id, period, "correlation_insights", json.dumps(result))
    except Exception as e:
        logger.error(f"Background correlation insights generation failed: {e}")
    finally:
        db.close()


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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    cached = _get_cache(db, current_user.id, period, "correlation_insights")
    if cached:
        return json.loads(cached)

    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    result = analytics_service.calculate_correlations_data(past_days)
    if not result:
        return {"message": "Not enough data points for correlation analysis"}

    for key in result["strongest_correlations"]:
        result["strongest_correlations"][key]["insights"] = []

    background_tasks.add_task(_generate_correlations_background, current_user.id, period)
    return result


@router.get("/summary/")
def generate_summary(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    cached = _get_cache(db, current_user.id, period, "summary")
    if cached:
        return {"summary": cached}

    past_days = parse_period_to_days(period)
    to_date = datetime.now()
    from_date = to_date - timedelta(days=past_days)
    analytics_service = AnalyticsService(db, current_user.id)
    entry_details = analytics_service.prepare_summary_data(from_date, to_date)

    if not entry_details:
        return {"summary": "No journal entries found for the specified period."}

    background_tasks.add_task(_generate_summary_background, current_user.id, period)
    return {"summary": "Generating insights... Check back shortly."}
