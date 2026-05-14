from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_chatbot import get_chatbot_response

router = APIRouter(
    prefix="/ai",
    tags=["ai"], # for swagger UI
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat/", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Endpoint to interact with the AI journal assistant.
    """
    user_message = request.message
    chatbot_response = get_chatbot_response(user_message)
    return ChatResponse(response=chatbot_response)