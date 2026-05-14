"""
API routes for AI chatbot interactions and journal question generation.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_chatbot import get_chatbot_response
from app.services.gemini_agent import generate_journal_question


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
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
    response: str


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


@router.post("/chat/", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Endpoint to interact with the AI journal assistant.

    Args:
        request (ChatRequest): The chat request containing the user's message.

    Returns:
        ChatResponse: The chatbot's response.
    """
    user_message = request.message
    chatbot_response = get_chatbot_response(user_message)
    return ChatResponse(response=chatbot_response)


@router.post("/journal-question/", response_model=JournalQuestionResponse)
async def get_journal_question(request: JournalQuestionRequest):
    """
    Endpoint to get an AI-generated follow-up question for a journal entry.

    Args:
        request (JournalQuestionRequest):
        The request containing the journal entry content.

    Returns:
        JournalQuestionResponse: The AI-generated question.
    """
    question = generate_journal_question(request.content)
    return JournalQuestionResponse(question=question)
