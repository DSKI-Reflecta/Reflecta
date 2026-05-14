import os
import concurrent.futures
from typing import List
from enum import Enum
from pydantic import BaseModel, Field
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
genai_client = genai.Client(api_key=api_key)
model = "gemini-2.0-flash"


class Activity(BaseModel):
    value: str


class Sentiment(str, Enum):
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


# Simple response classes for structured output
class FormattedText(BaseModel):
    text: str


class ActivityList(BaseModel):
    activities: List[Activity] = Field(
        description="List of activities extracted from the journal entry")


class SentimentList(BaseModel):
    sentiments: List[Sentiment] = Field(
        description="List of sentiments extracted from the journal entry")


def format_journal_content(content: str) -> str:
    """Format the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Format the entry by:
        - Adding clear section headers for different times of day
        (e.g., Morning, Afternoon, Evening).
        - Making each header bold.
        - Enhancing readability with a few subtle, relevant emojis.
        - IMPORTANT: Correcting any unclear phrasing, grammar,
        or language mistakes, while preserving the original
        personal tone and style. Return only the formatted journal
        content and no extra commentary or explanation.""",
        config={
            "response_mime_type": "application/json",
            "response_schema": FormattedText,
        },
    )
    return response.parsed.text.strip()


def extract_activities(content: str, amount: int) -> str:
    """Extract activities from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Extract up to {amount} key activities mentioned in the text.
        Only include an activity if it's clearly present and meaningful.
        Fewer, highly relevant activities are better than many vague or
        marginal ones. Focus on what truly matters
        in the context of the entry.
        Prioritize QUALITY and clarity over quantity.""",
        config={
            "response_mime_type": "application/json",
            "response_schema": ActivityList,
        },
    )
    return ", ".join(
        [activity.value for activity in response.parsed.activities])


def extract_sentiments(content: str, amount: int) -> str:
    """Extract sentiments from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Identify the main emotions or feelings expressed in
        this journal entry. Select up to {amount} sentiments that best
        match the emotional tone of the entry.""",
        config={
            "response_mime_type": "application/json",
            "response_schema": SentimentList,
        },
    )
    return ", ".join(
        [sentiment.value for sentiment in response.parsed.sentiments])


def extract_goals(content: str, goals: str) -> str:
    """Extract goals from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n{content}\n.
        Here is the list of goals (each with an ID, title and description):
        \n{goals}\n
        Based on the entry, list the relevant goal IDs as a
        comma-separated list of numbers.
        Do not include any list formatting, quotes, or explanations.
        Example output: 1, 3, 5"""
    )
    # Convert the response text to a list of integers
    try:
        return [int(x.strip()) for x in response.text.split(",")]
    except ValueError:
        return []


def analyze_entry(content: str, goals: str) -> tuple:
    """Analyze the journal entry content using concurrent tasks.
    This means that the tasks will run in parallel."""
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f1 = executor.submit(format_journal_content, content)
        f2 = executor.submit(extract_activities, content, 8)
        f3 = executor.submit(extract_sentiments, content, 5)
        f4 = executor.submit(extract_goals, content, goals)
        return f1.result(), f2.result(), f3.result(), f4.result()
