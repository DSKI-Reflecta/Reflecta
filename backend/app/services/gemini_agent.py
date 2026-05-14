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
        contents=f"""This is a journal entry:\n\n{content}

Your task:
Format the journal entry by adding clear section headers for different times of day, such as:
- Morning ☀️
- Afternoon ☕
- Evening 🌙

**Key Instructions:**
- Make section headers bold (**like this**) and include a relevant, subtle emoji next to each header.
- Insert a line break before every section like this: `\\n\\n` (exactly two newlines, no extra characters).
- Organize the text logically into these time-based sections, **only if the content naturally contains events from multiple times of day**. If the entry is short or only mentions one time of day, do NOT force extra sections.
- Keep the text easy to read and improve unclear phrasing or fix language mistakes carefully, without changing the original personal tone or meaning.
- Add a few relevant emojis inside the text (subtly) to enhance readability—but don't overuse them.
- Return only the **formatted journal entry** itself—no extra commentary or notes.

**Example Good Output (for a longer entry):**
**Morning** ☀️\\n\\nWoke up feeling pretty tired today, probably didn’t get enough sleep. Had a quick breakfast and then jumped straight into work. Felt a bit overwhelmed with all the tasks piling up, especially the project deadline next week.\\n\\n
**Afternoon** ☕\\n\\nTook a short walk during lunch to clear my head – that helped a bit. In the afternoon, I finally made some progress on the API integration I was stuck on, which felt really good. Still, I’m feeling like I’m constantly behind. Maybe I need to revisit how I’m planning my week.\\n\\n
**Evening** 🌙\\n\\nAlso had a good talk with Sarah in the evening, we haven’t caught up in a while. Ending the day with some reading and trying to get to bed earlier.

**Important:** Do NOT copy or reuse this example in your output. Every output must be based ONLY on the provided journal entry content. If the entry is too short or only covers one time of day, do not artificially expand or add sections.""",
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

Your task:
Identify and return the IDs of goals (comma-separated) toward which the journal entry shows **clear, positive progress**.

⚠️ Strict Rules:
- Match a goal ONLY if the entry shows clear **positive action**, effort, or success related to that goal.
- Do NOT match goals if the entry mentions:
  - Doubt, uncertainty, or hesitation.
  - Failure, struggle, or opposite behavior.
  - Neutral mentions of the topic without clear positive effort or results.
- Do NOT match goals just because the topic appears casually.

❗ Examples:
1. Entry: "I didn’t sleep enough." → No match.
2. Entry: "I probably didn’t get enough sleep." → No match.
3. Entry: "I slept well and feel rested." → Match: Goal 'Get enough sleep'.
4. Entry: "I went to the gym." → Match: Goal 'Exercise regularly'.
5. Entry: "I was planning to exercise but didn’t." → No match.
6. Entry: "I thought about eating healthier." → No match.

⚡ Special Note:
If the entry says something like “I’m trying to improve X” or “I made an effort to Y”, only match if actual **concrete positive action** or result is clearly described.

✅ Output Format:
- Return ONLY a comma-separated list of matched goal IDs.
- No text, no explanations, no quotes.
- Example output: 2, 5, 7

🚫 Do NOT copy from the examples above. Match goals ONLY based on the actual journal entry provided.
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
