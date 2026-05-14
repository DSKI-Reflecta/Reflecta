"""
Module for a simple Gemini-powered chatbot assistant.
Handles user messages and provides responses based on a defined system prompt.
"""

import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field


# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
# Initialize Gemini client
genai_client = genai.Client(api_key=api_key)
model = "gemini-2.0-flash"


class Answer(BaseModel):
    """
    Pydantic model for the chatbot's response.
    """
    text: str = Field(..., description="The response text from the chatbot")


class Request(BaseModel):
    """
    Pydantic model for the user's request to the chatbot.
    """
    message: str = Field(..., description="The user message to the chatbot")


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


def get_chatbot_response(user_message: str) -> str:
    """
    Retrieves a response from the Gemini chatbot based on the user's message.

    Args:
        user_message (str): The message from the user to the chatbot.

    Returns:
        str: The chatbot's generated text response.
    """
    chat_message = genai_client.models.generate_content(
        model=model,
        config={"system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "response_schema": Answer},
        contents=user_message,
    )
    return chat_message.parsed.text.strip()
