"""
utility functions for analytics and data processing.
"""

from fastapi import HTTPException


def parse_period_to_days(period: str) -> int:
    """Converts a period string (e.g., '7days') to an integer of days."""
    if period.endswith("days"):
        return int(period.replace("days", ""))
    elif period.endswith("months"):
        return int(period.replace("months", "")) * 30
    elif period.endswith("years"):
        return int(period.replace("years", "")) * 365
    try:
        return int(period)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid period format.")
