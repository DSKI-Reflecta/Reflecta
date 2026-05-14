from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
