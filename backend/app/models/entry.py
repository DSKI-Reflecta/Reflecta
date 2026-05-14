from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import IntEnum  # for mapping enums to integers
from datetime import date as date_type

"""
IntEnum members behave like integers, e.g.:
SentimentLevel.NEGATIVE < SentimentLevel.POSITIVE  # True
int(SentimentLevel.NEUTRAL)  # 3
"""


# --- State Tracking Fields (IntEnums) ---

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


# --- Journal Entry Models (for different CRUD operations) ---

class JournalEntryBase(BaseModel):
    """Base model for journal entries."""
    #  ... stands for required fields
    title: str = Field(..., description="The title of the journal entry")
    date: date_type = Field(..., description="The date of the journal entry")
    content: str = Field(...,
                         description="The main content of the journal entry")

    sentiment_level: Optional[SentimentLevel] = None
    sleep_quality: Optional[SleepQuality] = None
    stress_level: Optional[StressLevel] = None
    social_engagement: Optional[SocialEngagement] = None


class JournalEntryCreate(JournalEntryBase):
    """Model for creating a new journal entry,
    inherits all fields from JournalEntryBase.
    Format content is optional and defaults to False"""
    pass


class JournalEntryUpdate(BaseModel):
    """Model for updating an existing journal entry,
    all fields are hence optional"""
    title: Optional[str] = None
    date: Optional[date_type] = None
    content: Optional[str] = None

    sentiment_level: Optional[SentimentLevel] = None
    sleep_quality: Optional[SleepQuality] = None
    stress_level: Optional[StressLevel] = None
    social_engagement: Optional[SocialEngagement] = None


class JournalEntry(JournalEntryBase):
    """Model for a journal entry,
    inherits all fields from JournalEntryBase and
    adds additional fields used in the backend"""
    # Database fields
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # AI-generated analysis fields
    formatted_content: Optional[str] = None
    activities: Optional[list[str]] = None
    sentiment_analysis: Optional[str] = None
    keywords: Optional[list[str]] = None

    # model can be directly created from SQLAlchemy object
    class Config:
        from_attributes = True
