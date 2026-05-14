from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from datetime import date as date_type  # Import date type with an alias
from enum import Enum  # Import Enum


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
    target_date: Optional[date_type] = Field(
        None,
        description="Target date for the goal (optional for recurring goals)"
    )
    category: str = Field(..., description="The category of the goal")
    priority: GoalPriority = Field(..., description="The priority of the goal")
    description: Optional[str] = Field(None,
                                       description="A brief goal description")


class GoalCreate(GoalBase):
    """Model for creating a new Goal.
    Inherits all fields from GoalBase."""
    pass


class GoalUpdate(BaseModel):
    """Model for updating an existing Goal."""
    # Allow optional updates for all fields
    title: Optional[str] = None
    type: Optional[str] = None
    # Allow optional update for targetDate
    target_date: Optional[date_type] = None
    category: Optional[str] = None
    priority: Optional[GoalPriority] = None
    description: Optional[str] = None
    progress: Optional[int] = Field(
        None,
        description="The current progress percentage (0-100)"
    )


class Goal(GoalBase):
    """Model for reading a Goal from the database."""
    id: int
    progress: int = Field(
        0,  # Default progress is 0
        description="The current progress percentage (0-100)")
    created_at: datetime
    updated_at: Optional[datetime] = None

    # model can be directly created from SQLAlchemy object
    class Config:
        from_attributes = True
        # Allow converting Enum value to its string value
        use_enum_values = True
