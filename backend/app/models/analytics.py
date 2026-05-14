from pydantic import BaseModel
from typing import List, Optional


class TsTrends(BaseModel):
    dates: List[str]
    sentiment: List[Optional[int]]
    sleep: List[Optional[int]]
    stress: List[Optional[int]]
    social: List[Optional[int]]


class Averages(BaseModel):
    sentiment: float
    sleep: float
    stress: float
    social: float
