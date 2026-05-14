from fastapi import APIRouter, Depends

from app.db.database import UserModel
from app.auth.dependencies import get_current_user
from app.models.auth import UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user
