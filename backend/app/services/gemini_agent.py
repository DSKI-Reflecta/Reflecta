"""
Module for interacting with the Gemini AI model for
various journaling and goal-setting tasks. This includes
recommending goals, formatting journal content, extracting
activities and sentiments, and generating follow-up questions.
"""

import os
import concurrent.futures
from enum import Enum
from typing import List, Optional

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field


# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
genai_client = genai.Client(api_key=api_key)
model = "gemini-2.0-flash"


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


def recommend_goals(entries: str) -> List[RecommendedGoal]:
    """
    Recommends 3-5 specific and actionable goals based on journal entries.

    Args:
        entries (str): A string containing the user's recent journal entries.

    Returns:
        List[RecommendedGoal]: A list of recommended goals.
    """
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""You are an AI assistant that helps users set meaningful goals based on their journal entries.

Here are the user's recent journal entries:
{entries}

Your task is to recommend 3-5 specific, actionable, and positive goals based on the themes, challenges, and aspirations found in these entries.

**Key Instructions:**
- **Analyze Deeper Themes:** Look for recurring topics, struggles, or desires (e.g., feeling tired, stressed about work, wanting to connect more with friends).
- **Frame Goals Positively:** Instead of "Stop being stressed," suggest "Develop a weekly routine for managing stress."
- **Be Specific and Actionable:** A good goal is measurable. "Exercise more" is vague; "Go for a 30-minute walk three times a week" is better.
- **Vary the Categories:** Suggest goals across different areas of life if possible (e.g., Health, Career, Social, Personal Growth).
- **Keep Descriptions Brief:** The description should be motivating and explain the 'why' behind the goal in one or two sentences.

**Example Output Structure:**
- Goal 1:
  - Title: "Establish a Consistent Morning Routine"
  - Description: "Create a calming morning routine to start the day with less stress and more intention. This can help improve focus and overall well-being."
  - Category: "Personal Growth"
- Goal 2:
  - Title: "Dedicate Time for a Hobby Weekly"
  - Description: "Set aside at least one hour per week for a hobby you enjoy. This is a great way to recharge and reconnect with your passions outside of work."
  - Category: "Health"

**Important:**
- Return ONLY the list of recommended goals in the specified JSON format.
- Do not add any extra commentary or introductory text.
""",
        config={
            "response_mime_type": "application/json",
            "response_schema": RecommendedGoalList,
        },
    )
    return response.parsed.goals


def format_journal_content(content: str) -> str:
    """
    Formats the journal entry content
    by adding section headers and subtle emojis.

    Args:
        content (str): The raw journal entry content.

    Returns:
        str: The formatted journal entry content.
    """
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
    """
    Extracts key activities from the journal entry content.

    Args:
        content (str): The journal entry content.
        amount (int): The maximum number of activities to extract.

    Returns:
        str: A comma-separated string of extracted activities.
    """
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
    """
    Extracts main emotions or feelings expressed in the journal entry.

    Args:
        content (str): The journal entry content.
        amount (int): The maximum number of sentiments to extract.

    Returns:
        str: A comma-separated string of extracted sentiments.
    """
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


def extract_goals(content: str, goals: str) -> List[int]:
    """
    Identifies and returns the IDs of goals toward
    which the journal entry shows clear, positive progress.

    Args:
        content (str): The journal entry content.
        goals (str): A string representation of available goals
        with their IDs, titles, and descriptions.

    Returns:
        List[int]: A list of integer IDs of matched goals.
    """
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
    try:
        return [int(x.strip()) for x in response.text.split(",")]
    except ValueError:
        return []


def generate_journal_question(current_content: str) -> str:
    """
    Generates a thoughtful, open-ended follow-up question for a journal entry.

    Args:
        current_content (str): The current journal entry content.

    Returns:
        str: An AI-generated question to deepen reflection.
    """
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


def enhance_goal_description(
    title: str,
    description: Optional[str] = None
) -> str:
    """
    Enhances an existing goal description or generates a new one using AI.

    Args:
        title (str): The title of the goal.
        description (Optional[str]): The current description of the goal.

    Returns:
        str: The enhanced or newly generated goal description.
    """
    prompt = f"""You are an AI assistant specialized in writing clear, motivating, and actionable goal descriptions.

Goal Title: {title}
Current Description: {description if description else "None provided."}

Your task:
- If a description is provided, rewrite it to be more inspiring, clear, and actionable.
- If no description is provided, generate a concise and motivating description based on the title.
- The description should be 1-3 sentences long.
- Focus on the positive outcome and actionable steps.
- Return ONLY the enhanced or generated description. No extra commentary.

Example:
Title: "Read more books"
Current Description: "I want to read more."
Output: "Cultivate a consistent reading habit to expand your knowledge and relax your mind. Aim to read for at least 15 minutes daily."

Title: "Learn a new skill"
Current Description: "None provided."
Output: "Embark on a journey to master a new skill that aligns with your personal or professional growth. Dedicate regular time to practice and learn."
"""
    response = genai_client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": FormattedText,
        },
    )
    return response.parsed.text.strip()


def summarize_journal_entries(entries: str) -> str:
    """
    Generates an in-depth summary of a list of journal entries.

    Args:
        entries (str): A string containing the user's recent journal entries.

    Returns:
        str: A detailed summary of the journal entries.
    """
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""You are a thoughtful journaling assistant.

Your job is to analyze the user's recent journal entries and return an in-depth summary that captures the emotional patterns, recurring thoughts, key themes, and significant moments in their reflections.

Here are the journal entries:
{entries}

Write a multi-paragraph summary that:
- Opens with a natural sentence like "You talked a lot about..." or "Over the past entries, you reflected deeply on..."
- Describes recurring topics and themes in depth
- Identifies emotional patterns (e.g., increasing stress, hopefulness, confusion, motivation)
- Mentions any important or transformative experiences
- Uses a reflective, human tone — not clinical or robotic
- Avoids generic summaries; make it feel like you're truly "listening"

Format:
- Return ONLY a JSON object with this structure:
  {{ "summary": "<your detailed summary text here>" }}

Do NOT include any introductory explanations or additional metadata.
""",
        config={
            "response_mime_type": "application/json",
            "response_schema": FormattedText,
        },
    )
    return response.parsed.text.strip()


def analyze_entry(content: str, goals: str) -> tuple:
    """
    Analyzes the journal entry content using concurrent tasks to extract
    formatted content, activities, sentiments, and associated goals.

    Args:
        content (str): The journal entry content to analyze.
        goals (str): A string representation of available goals for extraction.

    Returns:
        tuple: A tuple containing:
        (formatted_content, activities, sentiments, goal_ids).
    """
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f1 = executor.submit(format_journal_content, content)
        f2 = executor.submit(extract_activities, content, 8)
        f3 = executor.submit(extract_sentiments, content, 5)
        f4 = executor.submit(extract_goals, content, goals)
        return f1.result(), f2.result(), f3.result(), f4.result()
