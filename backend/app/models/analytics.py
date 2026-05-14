"""
Pydantic models for analytics data.
"""

from typing import List, Optional
from pydantic import BaseModel


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
    sentiment: float
    sleep: float
    stress: float
    social: float
    total_entries: int
    current_streak: int
    average_words_per_entry: float
