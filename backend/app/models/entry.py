from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum, IntEnum


class SentimentLevel(IntEnum):
    VERY_NEGATIVE = 1
    NEGATIVE = 2
    NEUTRAL = 3
    POSITIVE = 4
    VERY_POSITIVE = 5


class SleepQuality(IntEnum):
    VERY_POOR = 1
    POOR = 2
    AVERAGE = 3
    GOOD = 4
    EXCELLENT = 5


class StressLevel(IntEnum):
    VERY_LOW = 1
    LOW = 2
    MODERATE = 3
    HIGH = 4
    VERY_HIGH = 5


class SocialEngagement(IntEnum):
    ALONE = 1
    MINIMAL = 2
    MODERATE = 3
    SOCIAL = 4
    VERY_SOCIAL = 5


class JournalEntryBase(BaseModel):
    content: str = Field(..., description="The main content of the journal entry")
    sentiment_level: Optional[SentimentLevel] = None
    sleep_quality: Optional[SleepQuality] = None
    stress_level: Optional[StressLevel] = None
    social_engagement: Optional[SocialEngagement] = None


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(BaseModel):
    content: Optional[str] = None
    sentiment_level: Optional[SentimentLevel] = None
    sleep_quality: Optional[SleepQuality] = None
    stress_level: Optional[StressLevel] = None
    social_engagement: Optional[SocialEngagement] = None


class JournalEntry(JournalEntryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # AI-generated analysis fields
    formatted_content: Optional[str] = None
    activities: Optional[list[str]] = None
    sentiment_analysis: Optional[str] = None
    keywords: Optional[list[str]] = None

    class Config:
        from_attributes = True