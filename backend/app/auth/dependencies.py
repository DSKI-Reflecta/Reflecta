import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.cognito import verify_token
from app.db.database import get_db, UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)

DEV_MODE = os.getenv("DEV_MODE", "").lower() == "true"


def _get_or_create_dev_user(db: Session) -> UserModel:
    user = db.query(UserModel).filter(UserModel.cognito_sub == "dev-user").first()
    if not user:
        user = UserModel(cognito_sub="dev-user", email="dev@localhost", is_admin=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    if DEV_MODE:
        return _get_or_create_dev_user(db)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = verify_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cognito_sub = payload.get("sub")
    email = payload.get("email", "")

    user = db.query(UserModel).filter(UserModel.cognito_sub == cognito_sub).first()
    if not user:
        user = UserModel(cognito_sub=cognito_sub, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.email != email and email:
        user.email = email
        db.commit()

    return user


def get_current_admin(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
