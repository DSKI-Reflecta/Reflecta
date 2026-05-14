from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from datetime import date as date_type # Import date type with an alias
from enum import Enum # Import Enum

# Define an Enum for Goal Priority
class GoalPriority(str, Enum):
    """Enum for Goal Priority levels."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

# Pydantic models for Goals

class GoalBase(BaseModel):
    """Base model for Goal attributes."""
    title: str = Field(..., description="The title of the goal")
    type: str = Field(..., description="The type of the goal (e.g., 'One-time', 'Recurring')")
    # Make targetDate Optional
    targetDate: Optional[date_type] = Field(None, description="The target date for the goal (optional for recurring goals)") # Use the alias date_type
    category: str = Field(..., description="The category of the goal (e.g., 'Health', 'Career')")
    # Use the GoalPriority Enum for priority
    priority: GoalPriority = Field(..., description="The priority of the goal ('Low', 'Medium', 'High')")
    description: Optional[str] = Field(None, description="A brief description of the goal")
    # Progress is not part of the base creation, only update


class GoalCreate(GoalBase):
    """Model for creating a new Goal."""
    # Inherits all fields from GoalBase
    pass


class GoalUpdate(BaseModel):
    """Model for updating an existing Goal."""
    # Allow optional updates for all fields
    title: Optional[str] = None
    type: Optional[str] = None
    # Allow optional update for targetDate
    targetDate: Optional[date_type] = None # Use the alias date_type and make it Optional
    category: Optional[str] = None
    # Allow optional update for priority using the Enum
    priority: Optional[GoalPriority] = None
    description: Optional[str] = None
    progress: Optional[int] = Field(None, description="The current progress percentage (0-100)")


class Goal(GoalBase):
    """Model for reading a Goal from the database."""
    id: int
    progress: int = Field(0, description="The current progress percentage (0-100)") # Default to 0 for read
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True # Use from_attributes instead of orm_mode for Pydantic V2+
        # Allow converting Enum value to its string value
        use_enum_values = True

