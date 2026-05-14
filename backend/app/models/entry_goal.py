from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict # Import ConfigDict
from datetime import date as date_type  # Import date type with an alias
from enum import Enum, IntEnum


"""
IntEnum members behave like integers, e.g.:
SentimentLevel.NEGATIVE < SentimentLevel.POSITIVE  # True
int(SentimentLevel.NEUTRAL)  # 3
"""


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


class GoalPriority(str, Enum):
    """Enum for Goal Priority levels."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class GoalBase(BaseModel):
    """Base model for Goal attributes."""
    title: str = Field(..., description="The title of the goal")
    type: str = Field(...,
                      description="The type of the goal")
    # Added alias='targetDate' to map frontend camelCase to backend snake_case
    target_date: Optional[date_type] = Field(
        None,
        description="Target date for the goal (optional for recurring goals)",
        alias='targetDate'
    )
    category: str = Field(..., description="The category of the goal")
    priority: GoalPriority = Field(..., description="The priority of the goal")
    description: Optional[str] = Field(None,
                                       description="A brief goal description")

    # Configure Pydantic to allow population by field name or alias
    model_config = ConfigDict(populate_by_name=True)


class GoalCreate(GoalBase):
    """Model for creating a new Goal.
    Inherits all fields from GoalBase."""
    pass


class GoalUpdate(BaseModel):
    """Model for updating an existing Goal."""
    # Allow optional updates for all fields
    title: Optional[str] = None
    type: Optional[str] = None
    # Added alias='targetDate' for the update model as well
    target_date: Optional[date_type] = Field(
        None,
        description="Target date for the goal (optional for recurring goals)",
        alias='targetDate'
    )
    category: Optional[str] = None
    priority: Optional[GoalPriority] = None
    description: Optional[str] = None
    progress: Optional[int] = Field(
        None,
        description="The current progress percentage (0-100)"
    )

    # Configure Pydantic to allow population by field name or alias
    model_config = ConfigDict(populate_by_name=True)


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
    goals: Optional[List[int]] = None


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


class JournalEntryBasic(JournalEntryBase):
    """Model for a journal entry,
    inherits all fields from JournalEntryBase and
    adds additional fields used in the backend"""
    # Database fields
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # AI-generated analysis fields
    formatted_content: Optional[str] = None
    activities: Optional[str] = None
    sentiments: Optional[str] = None

    # model can be directly created from SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)


class Goal(GoalBase):
    """Model for reading a Goal from the database."""
    id: int
    progress: int = Field(
        0,  # Default progress is 0
        description="The current progress percentage (0-100)")
    created_at: datetime
    updated_at: Optional[datetime] = None

    # relationship with JournalEntry without its goals
    journal_entries: Optional[List[JournalEntryBasic]] = None

    # model can be directly created from SQLAlchemy object
    model_config = ConfigDict(from_attributes=True, use_enum_values=True) # Use model_config


class JournalEntry(JournalEntryBasic):
    """Model for a journal entry,
    inherits all fields from JournalEntryBasic and
    adds additional fields used in the backend"""
    # Many-to-many relationship with goals
    goals: Optional[List[Goal]] = None
