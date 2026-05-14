from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_chatbot import get_chatbot_response
from app.services.gemini_agent import generate_journal_question

router = APIRouter(
    prefix="/ai",
    tags=["ai"]  # for swagger UI
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class JournalQuestionRequest(BaseModel):
    content: str


class JournalQuestionResponse(BaseModel):
    question: str


@router.post("/chat/", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Endpoint to interact with the AI journal assistant.
    """
    user_message = request.message
    chatbot_response = get_chatbot_response(user_message)
    return ChatResponse(response=chatbot_response)


@router.post("/journal-question/", response_model=JournalQuestionResponse)
async def get_journal_question(request: JournalQuestionRequest):
    """
    Endpoint to get an AI-generated follow-up question for a journal entry.
    """
    question = generate_journal_question(request.content)
    return JournalQuestionResponse(question=question)
