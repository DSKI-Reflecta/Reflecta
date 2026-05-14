"""
API routes for admin dashboard.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db, UserModel, JournalEntryModel, AIUsageLog
from app.auth.dependencies import get_current_admin


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: UserModel = Depends(get_current_admin),
):
    total_users = db.query(func.count(UserModel.id)).scalar()

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    active_users_7d = (
        db.query(func.count(func.distinct(JournalEntryModel.user_id)))
        .filter(JournalEntryModel.created_at >= seven_days_ago)
        .scalar()
    )

    total_entries = db.query(func.count(JournalEntryModel.id)).scalar()

    total_ai_calls = db.query(func.count(AIUsageLog.id)).scalar()

    successful_calls = (
        db.query(func.count(AIUsageLog.id))
        .filter(AIUsageLog.success == True)
        .scalar()
    )
    ai_success_rate = (
        round((successful_calls / total_ai_calls) * 100, 1)
        if total_ai_calls > 0
        else 100.0
    )

    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    ai_calls_today = (
        db.query(func.count(AIUsageLog.id))
        .filter(AIUsageLog.created_at >= today_start)
        .scalar()
    )

    ai_tokens_total = (
        db.query(
            func.coalesce(func.sum(AIUsageLog.input_tokens), 0)
            + func.coalesce(func.sum(AIUsageLog.output_tokens), 0)
        ).scalar()
    )

    return {
        "total_users": total_users,
        "active_users_7d": active_users_7d,
        "total_entries": total_entries,
        "total_ai_calls": total_ai_calls,
        "ai_success_rate": ai_success_rate,
        "ai_calls_today": ai_calls_today,
        "ai_tokens_total": ai_tokens_total,
    }
