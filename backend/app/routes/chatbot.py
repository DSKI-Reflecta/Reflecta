"""
API routes for AI chatbot interactions and journal question generation.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.gemini_chatbot import get_contextual_chatbot_response
from app.services.gemini_agent import generate_journal_question
from app.models.chat_agent import ChatRequest, ChatResponse, JournalQuestionRequest, JournalQuestionResponse
from app.db.database import get_db


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


@router.post("/chat/", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint to interact with the AI journal assistant.

    Args:
        request (ChatRequest): The chat request containing the user's message.
        db (Session): The database session.

    Returns:
        ChatResponse: The chatbot's response.
    """
    user_message = request.message
    chatbot_response = get_contextual_chatbot_response(user_message, db)
    return ChatResponse(text=chatbot_response)


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
