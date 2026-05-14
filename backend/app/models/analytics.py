"""
Pydantic models for analytics data.
"""

from pydantic import BaseModel
from typing import List, Optional


class TsTrends(BaseModel):
    """
    Time series trends for various metrics.
    """
    dates: List[str]
    sentiment: List[Optional[int]]
    sleep: List[Optional[int]]
    stress: List[Optional[int]]
    social: List[Optional[int]]


class Averages(BaseModel):
    """
    Average values for various metrics, including trends.
    """
    total_entries: int
    longest_streak: int
    average_words: float
    average_mood: float
    average_sleep_quality: float
    average_stress_level: float
    average_social_engagement: float
    total_entries_trend: float
    longest_streak_trend: float
    average_words_trend: float
    average_mood_trend: float
    average_sleep_quality_trend: float
    average_stress_level_trend: float
    average_social_engagement_trend: float
