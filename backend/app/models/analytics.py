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
    Average values for various metrics.
    """
    sentiment: float
    sleep: float
    stress: float
    social: float
