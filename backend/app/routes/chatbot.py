"""
API routes for AI chatbot interactions and journal question generation.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.gemini_chatbot import get_contextual_chatbot_response
from app.services.gemini_agent import generate_journal_question
from app.models.chat_agent import (
    ChatRequest,
    ChatResponse,
    JournalQuestionRequest,
    JournalQuestionResponse,
)
from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


@router.post("/chat/", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    user_message = request.message
    chatbot_response = get_contextual_chatbot_response(
        user_message, db, current_user.id
    )
    return ChatResponse(text=chatbot_response)


@router.post("/journal-question/", response_model=JournalQuestionResponse)
async def get_journal_question(
    request: JournalQuestionRequest,
    current_user: UserModel = Depends(get_current_user),
):
    question = generate_journal_question(request.content)
    return JournalQuestionResponse(question=question)
