"""
Pydantic models for chatbot and agent.
"""


from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Activity(BaseModel):
    """
    Pydantic model for an extracted activity.
    """
    value: str


class Sentiment(str, Enum):
    """
    Enum for various sentiment levels.
    """
    HAPPY = "Happy"
    SAD = "Sad"
    ANGRY = "Angry"
    ANXIOUS = "Anxious"
    EXCITED = "Excited"
    CONTENT = "Content"
    TIRED = "Tired"
    STRESSED = "Stressed"
    GRATEFUL = "Grateful"
    FRUSTRATED = "Frustrated"
    HOPEFUL = "Hopeful"
    CALM = "Calm"
    WORRIED = "Worried"
    PROUD = "Proud"
    OVERWHELMED = "Overwhelmed"
    INSPIRED = "Inspired"
    MOTIVATED = "Motivated"
    CONFUSED = "Confused"
    PEACEFUL = "Peaceful"
    DISAPPOINTED = "Disappointed"


class FormattedText(BaseModel):
    """
    Pydantic model for formatted text response.
    """
    text: str


class ActivityList(BaseModel):
    """
    Pydantic model for a list of extracted activities.
    """
    activities: List[Activity] = Field(
        description="List of activities extracted from the journal entry")


class SentimentList(BaseModel):
    """
    Pydantic model for a list of extracted sentiments.
    """
    sentiments: List[Sentiment] = Field(
        description="List of sentiments extracted from the journal entry")


class RecommendedGoal(BaseModel):
    """
    Pydantic model for a recommended goal.
    """
    title: str = Field(description="A clear, concise title for the goal.")
    description: str = Field(
        description="A brief, motivating description of the goal."
    )
    category: str = Field(
        description="A relevant category for the goal "
        "(e.g., Health, Career, Personal Growth)."
    )


class RecommendedGoalList(BaseModel):
    """
    Pydantic model for a list of recommended goals.
    """
    goals: List[RecommendedGoal] = Field(
        description="A list of recommended goals based on "
        "the user's journal entries."
    )


class InsightList(BaseModel):
    """
    Pydantic model for a list of insights.
    """
    insights: List[str] = Field(
        description="List of insights generated for the chart"
    )


class ChatRequest(BaseModel):
    """
    Request model for chatbot interaction.
    """
    message: str


class ChatResponse(BaseModel):
    """
    Response model for chatbot interaction.
    """
    text: str


class JournalQuestionRequest(BaseModel):
    """
    Request model for generating a journal question.
    """
    content: str


class JournalQuestionResponse(BaseModel):
    """
    Response model for a generated journal question.
    """
    question: str


class EnhanceDescriptionRequest(BaseModel):
    """
    Request model for enhancing a goal description.
    """
    title: str
    description: Optional[str] = None
