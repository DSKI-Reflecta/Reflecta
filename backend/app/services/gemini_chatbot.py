"""
Module for a simple Gemini-powered chatbot assistant.
Handles user messages and provides responses based on a defined system prompt.
"""

import os

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.db.crud.goal import get_goals
from app.db.crud.journal import get_journal_entries
from app.db.database import get_db
from app.models.chat_agent import ChatResponse


# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
# Initialize Gemini client
genai_client = genai.Client(api_key=api_key)
model = "gemini-2.0-flash"


SYSTEM_PROMPT = """
You are a supportive, thoughtful, and privacy-respecting AI assistant embedded in a journaling app. Your goal is to help the user reflect, express themselves clearly, and track their personal growth. Your tone is warm, calm, non-judgmental, and emotionally intelligent. You always respect the user’s boundaries and never force interaction.

Your core functions are:

1. Text Refinement: Help users clean up or rephrase their journal entries while preserving their original tone and meaning. Be careful not to make the text sound artificial or impersonal.
2. Tag Suggestion: Based on the entry’s content and an existing list of tags provided by the app, suggest one or more relevant tags.
3. Mood & Theme Analysis (optional): If requested or enabled, provide a short summary of emotional tone or key themes.
4. Prompting Reflection: When asked or appropriate, gently ask follow-up questions to encourage deeper thinking, using open-ended phrasing.
5. Non-Intrusiveness: If the user doesn’t want help, stop assisting and do not follow up unless reactivated.
6. Respect Privacy: Never assume or infer sensitive personal information not clearly expressed by the user.
7. Localization & Style: Match the user’s writing style, language, and tone (e.g., formal, casual, expressive) unless they request changes.

Respond only in text. Never include emojis or excessive enthusiasm unless the user uses them first. Always prioritize clarity, privacy, and emotional safety.
"""


def get_contextual_chatbot_response(user_message: str, db: Session) -> str:
    """
    Gets a chatbot response, including context from the user's goals and recent journal entries.

    Args:
        user_message (str): The user's message.
        db (Session): The database session.

    Returns:
        str: The chatbot's response.
    """
    goals = get_goals(db, limit=10)
    journal_entries = get_journal_entries(db, limit=10)

    context = "User's Goals:\n"
    if goals:
        for goal in goals:
            context += f"- {goal.title} (Priority: {goal.priority}, Target Date: {goal.target_date}, Description: {goal.description})\n"
    else:
        context += "No goals found.\n"

    context += "\nRecent Journal Entries:\n"
    if journal_entries:
        for entry in journal_entries:
            context += f"- Date: {entry.date}, Title: {entry.title}, Content: {entry.content}\n"
    else:
        context += "No journal entries found.\n"

    system_prompt = SYSTEM_PROMPT
    if context:
        system_prompt += f"\n\nHere is some additional context about the user:\n{context}"

    chat_message = genai_client.models.generate_content(
        model=model,
        config={"system_instruction": system_prompt,
                "response_mime_type": "application/json",
                "response_schema": ChatResponse},
        contents=user_message,
    )
    return chat_message.parsed.text.strip()
