"""
Module for interacting with the z.ai model (via OpenAI-compatible API) for
various journaling and goal-setting tasks.
"""

import json
from typing import List, Optional

from sqlalchemy.orm import Session

from app.services.ai_client import call_ai
from app.models.chat_agent import (
    EntryAnalysis,
    FormattedText,
    RecommendedGoal,
    RecommendedGoalList,
    InsightList,
)


def recommend_goals(
    entries: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> List[RecommendedGoal]:
    messages = [
        {"role": "user", "content": f"""You are an AI assistant that helps users set meaningful goals based on their journal entries.

Here are the user's recent journal entries:
{entries}

Your task is to recommend 3-5 specific, actionable, and positive goals based on the themes, challenges, and aspirations found in these entries.

**Key Instructions:**
- **Analyze Deeper Themes:** Look for recurring topics, struggles, or desires.
- **Frame Goals Positively:** Instead of "Stop being stressed," suggest "Develop a weekly routine for managing stress."
- **Be Specific and Actionable:** A good goal is measurable.
- **Vary the Categories:** Suggest goals across different areas of life if possible (e.g., Health, Career, Social, Personal Growth).
- **Keep Descriptions Brief:** 1-2 sentences.

Return a JSON object with a "goals" array. Each goal has "title", "description", and "category" fields."""}
    ]
    result = call_ai(messages, "recommend_goals", db, user_id, RecommendedGoalList)
    return result.goals


def format_journal_content(
    content: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""This is a journal entry:\n\n{content}

Your task:
Format the journal entry by adding clear section headers for different times of day, such as:
- Morning
- Afternoon
- Evening

**Key Instructions:**
- Make section headers bold (**like this**) and include a relevant, subtle emoji next to each header.
- Insert a line break before every section like this: `\\n\\n` (exactly two newlines).
- Organize the text logically into these time-based sections, **only if the content naturally contains events from multiple times of day**. If the entry is short or only mentions one time of day, do NOT force extra sections.
- Keep the text easy to read and improve unclear phrasing or fix language mistakes carefully, without changing the original personal tone or meaning.
- Add a few relevant emojis inside the text (subtly) to enhance readability.
- Return ONLY a JSON object with a "text" field containing the formatted journal entry."""}
    ]
    result = call_ai(messages, "format_content", db, user_id, FormattedText)
    return result.text.strip()


def extract_activities(
    content: str,
    amount: int,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""This is a journal entry.\n\n{content}.
Extract up to {amount} key activities mentioned in the text.
Only include an activity if it's clearly present and meaningful.
Fewer, highly relevant activities are better than many vague ones.
Focus on what truly matters in the context of the entry.

Return a JSON object with an "activities" array containing plain strings (e.g. {{"activities": ["Morning run", "Reading"]}})."""}
    ]
    result = call_ai(messages, "extract_activities", db, user_id)
    activities = result.get("activities", [])
    values = []
    for a in activities:
        if isinstance(a, dict):
            values.append(a.get("value", str(a)))
        else:
            values.append(str(a))
    return ", ".join(values)


def extract_sentiments(
    content: str,
    amount: int,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""This is a journal entry.\n\n{content}.
Identify the main emotions or feelings expressed in this journal entry.
Select up to {amount} sentiments that best match the emotional tone.

Valid sentiments: Happy, Sad, Angry, Anxious, Excited, Content, Tired, Stressed, Grateful, Frustrated, Hopeful, Calm, Worried, Proud, Overwhelmed, Inspired, Motivated, Confused, Peaceful, Disappointed.

Return a JSON object with a "sentiments" array containing plain strings (e.g. {{"sentiments": ["Happy", "Calm"]}})."""}
    ]
    result = call_ai(messages, "extract_sentiments", db, user_id)
    sentiments = result.get("sentiments", [])
    values = []
    for s in sentiments:
        if isinstance(s, dict):
            values.append(s.get("value", str(s)))
        else:
            values.append(str(s))
    return ", ".join(values)


def extract_goals(
    content: str,
    goals: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> List[int]:
    messages = [
        {"role": "user", "content": f"""You are a goal-matching assistant.

Journal entry:
{content}

Here is a list of goals with their IDs, titles, and descriptions:
{goals}

Your task:
Identify and return the IDs of goals toward which the journal entry shows **clear, positive progress**.

Strict Rules:
- Match a goal ONLY if the entry shows clear positive action, effort, or success related to that goal.
- Do NOT match goals if the entry mentions doubt, uncertainty, failure, or neutral mentions.
- Do NOT match goals just because the topic appears casually.

Return a JSON object with a "goal_ids" array containing the matched integer IDs. If no goals match, return {{"goal_ids": []}}."""}
    ]
    try:
        result = call_ai(messages, "extract_goals", db, user_id)
        goal_ids = result.get("goal_ids", [])
        return [int(x) for x in goal_ids]
    except (ValueError, KeyError):
        return []


def generate_journal_question(
    current_content: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""You are an AI journaling assistant. Your role is to help the user deepen and expand their journal entry by asking thoughtful, open-ended questions.

The user has written the following entry:
"{current_content}"

Your task:
- Ask ONE clear, open-ended question that encourages the user to explore another aspect of their thoughts or day, or helps them go deeper into emotions they haven't fully explored.
- If the user already focused on one topic in detail, gently guide them toward another area of reflection.
- Avoid questions that feel clinical or force introspection; your tone should feel natural, supportive, and curious.
- No additional explanations, just output the question itself.

Return a JSON object with a "text" field containing the question."""}
    ]
    result = call_ai(messages, "journal_question", db, user_id, FormattedText)
    return result.text.strip()


def enhance_goal_description(
    title: str,
    description: Optional[str] = None,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""You are an AI assistant specialized in writing clear, motivating, and actionable goal descriptions.

Goal Title: {title}
Current Description: {description if description else "None provided."}

Your task:
- If a description is provided, rewrite it to be more inspiring, clear, and actionable.
- If no description is provided, generate a concise and motivating description based on the title.
- The description should be 1-3 sentences long.
- Focus on the positive outcome and actionable steps.
- Return ONLY the enhanced or generated description.

Return a JSON object with a "text" field containing the description."""}
    ]
    result = call_ai(messages, "enhance_goal", db, user_id, FormattedText)
    return result.text.strip()


def summarize_journal_entries(
    entries: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> str:
    messages = [
        {"role": "user", "content": f"""You are a thoughtful journaling assistant.

Your job is to analyze the user's recent journal entries and return an in-depth summary that captures the emotional patterns, recurring thoughts, key themes, and significant moments in their reflections.

Here are the journal entries, with sentiments, activities and goals:
{entries}

Write a multi-paragraph summary that:
- Opens with a natural sentence like "You talked a lot about..." or "Over the past entries, you reflected deeply on..."
- Describes recurring topics and themes in depth
- Identifies emotional patterns
- Mentions any important or transformative experiences
- Uses a reflective, human tone

Return a JSON object with a "text" field containing the summary."""}
    ]
    result = call_ai(messages, "summarize_entries", db, user_id, FormattedText)
    return result.text.strip()


def analyze_entry(
    content: str,
    goals: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> tuple:
    messages = [
        {"role": "user", "content": f"""Analyze this journal entry and return a single JSON object with all of the following fields:

**Journal entry:**
{content}

**User's goals (with IDs):**
{goals}

**Tasks to perform:**

1. **formatted_content**: Format the journal entry by adding clear section headers for different times of day (Morning, Afternoon, Evening) - only if the content naturally spans multiple times. Make headers bold with a relevant emoji. Fix language mistakes without changing the personal tone. Add a few subtle emojis for readability.

2. **activities**: Extract up to 8 key activities mentioned. Only include clearly present, meaningful activities. Return as a plain string array.

3. **sentiments**: Identify main emotions expressed (up to 5). Valid values: Happy, Sad, Angry, Anxious, Excited, Content, Tired, Stressed, Grateful, Frustrated, Hopeful, Calm, Worried, Proud, Overwhelmed, Inspired, Motivated, Confused, Peaceful, Disappointed. Return as a plain string array.

4. **goal_ids**: Match goals ONLY if the entry shows clear positive action, effort, or success. Do NOT match for casual mentions, doubt, or failure. Return as an integer array. Empty array if no matches.

Return a JSON object with exactly these four fields."""}
    ]
    result = call_ai(messages, "analyze_entry", db, user_id, EntryAnalysis)
    activities = ", ".join(result.activities)
    sentiments = ", ".join(result.sentiments)
    return result.formatted_content, activities, sentiments, result.goal_ids


def generate_correlation_insights(
    chart_data: str,
    db: Optional[Session] = None,
    user_id: Optional[int] = None,
) -> List[str]:
    messages = [
        {"role": "user", "content": f"""You are an AI assistant that generates insights for correlation charts.
Here is the data for a correlation chart:
{chart_data}

Your task is to generate exactly three insights based on this data:
1. A statement about the correlation
2. A suggestion for improvement
3. A concrete recommendation

Return a JSON object with an "insights" array containing exactly 3 strings."""}
    ]
    result = call_ai(messages, "correlation_insights", db, user_id, InsightList)
    return result.insights
