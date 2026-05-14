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
        Format the journal entry by adding clear section headers for
        different times of day (e.g., Morning, Afternoon, Evening + Matching Emoji()
        Make the section header bold and add a line break before each section.
        You need to implement the linebreaks like this: \n\n
        Ensure the text is well-structured and easy to read.
        Include a few relevant emojis to enhance readability,
        but keep it subtle. Maintain the original personal writing style
        and tone, while correcting any unclear phrasing or language mistakes.
        Return only the formatted journal content itself,
        without any extra explanations or commentary.
        Good example Output:**Morning** ☀️\n\nWoke up feeling pretty tired today, probably didn’t get enough sleep. Had a quick breakfast and then jumped straight into work. Felt a bit overwhelmed with all the tasks piling up, especially the project deadline next week.\n\n**Afternoon** ☕\n\nTook a short walk during lunch to clear my head – that helped a bit. In the afternoon, I finally made some progress on the API integration I was stuck on, which felt really good. Still, I’m feeling like I’m constantly behind. Maybe I need to revisit how I’m planning my week.\n\n**Evening** 🌃\n\nAlso had a good talk with Sarah in the evening, we haven’t caught up in a while. Ending the day with some reading and trying to get to bed earlier. - Bad Example Output:😴 Woke up feeling pretty tired today, probably didn’t get enough sleep. Had a quick breakfast and then jumped straight into work. Felt a bit overwhelmed with all the tasks piling up, especially the project deadline next week.\n\n**☀️ Morning**\nTook a short walk during lunch to clear my head – that helped a bit.\n\n**🌤️ Afternoon**\nIn the afternoon, I finally made some progress on the API integration I was stuck on, which felt really good. Still, I’m feeling like I’m constantly behind. Maybe I need to revisit how I’m planning my week.\n\n**🌙 Evening**\nAlso had a good talk with Sarah in the evening, we haven’t caught up in a while. Ending the day with some reading and trying to get to bed earlier. 📚""",
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
        contents=f"""You are a goal-matching assistant.

Journal entry:
{content}

Here is a list of goals with their IDs, titles, and descriptions:
{goals}

Your task is to return a comma-separated list of IDs of goals that the journal entry shows **clear and positive progress** toward.

⚠️ Important rules:
- Do NOT include a goal if the journal entry expresses **doubt, failure, uncertainty, or opposite behavior**.
- Do NOT include a goal just because the topic is mentioned.
- If the entry says: "I didn’t sleep well", "I probably didn’t get enough sleep", or "My sleep was bad", then do **NOT** assign the goal "Get enough sleep".
- Only assign goals if the journal clearly shows effort or success related to the goal.

Examples:
- Entry: "I didn’t sleep enough." → No goals matched.
- Entry: "I probably didn’t sleep enough." → No goals matched.
- Entry: "I slept well and feel rested." → Match goal: "Get enough sleep".
- Entry: "I went to the gym." → Match goal: "Exercise regularly".

Format:
Return only the IDs of matching goals as a comma-separated list. Do not include any text, quotes, or formatting.

Example output: 1, 3, 5
""",
    )
    # Convert the response text to a list of integers
    try:
        return [int(x.strip()) for x in response.text.split(",")]
    except ValueError:
        return []


def generate_journal_question(current_content: str) -> str:
    """Generate a follow-up question for the journal entry."""
    prompt = f"""You are an AI journaling assistant. Your role is to help the user deepen and expand their journal entry by asking thoughtful, open-ended questions.

The user has written the following entry:
"{current_content}"

Your task:
- Ask ONE clear, open-ended question that either (a) encourages the user to explore *another* aspect of their thoughts or day, or (b) helps them go deeper into emotions or experiences they haven't fully explored yet.
- If the user already focused on one topic in detail (e.g., stress about university), avoid staying on that same topic and instead gently guide them toward another area of reflection (e.g., social life, hobbies, physical well-being, mindset shifts).
- If their entry feels very short or surface-level, your question may prompt them to expand on what they’ve already shared — but still avoid yes/no questions.
- Avoid questions that feel clinical or force introspection; your tone should feel natural, supportive, and curious.
- No additional explanations, just output the question itself.

Examples:
- User content: ""
  Question: "How did your day start today?"

- User content: "Today was pretty busy. I had a lot of meetings."
  Question: "How did you feel once your meetings were over?"

- User content: "I felt really happy after finishing my project."
  Question: "What other moments recently have made you feel this kind of happiness?"

- User content: "I’m really stressed with math at university right now."
  Question: "Outside of academics, what has been helping you unwind lately?"

Question:"""
    response = genai_client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": FormattedText,
        },
    )
    return response.parsed.text.strip()


def analyze_entry(content: str, goals: str) -> tuple:
    """Analyze the journal entry content using concurrent tasks.
    This means that the tasks will run in parallel."""
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f1 = executor.submit(format_journal_content, content)
        f2 = executor.submit(extract_activities, content, 8)
        f3 = executor.submit(extract_sentiments, content, 5)
        f4 = executor.submit(extract_goals, content, goals)
        return f1.result(), f2.result(), f3.result(), f4.result()
