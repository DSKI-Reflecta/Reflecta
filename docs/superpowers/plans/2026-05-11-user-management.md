# User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication with JWT so each user has private journal entries, goals, and analytics.

**Architecture:** New UserModel with user_id FK on entries/goals. Auth module (python-jose + passlib) provides password hashing, JWT tokens, and a FastAPI dependency. Frontend stores JWT in localStorage and sends it on every request; unauthenticated users see a login page.

**Tech Stack:** python-jose[cryptography], passlib[bcrypt], FastAPI OAuth2PasswordBearer, React Context API

---

## File Structure

### New files (backend)
- `backend/app/auth/__init__.py` - empty package marker
- `backend/app/auth/passwords.py` - hash/verify passwords
- `backend/app/auth/tokens.py` - create/decode JWT
- `backend/app/auth/dependencies.py` - get_current_user FastAPI dependency
- `backend/app/routes/auth.py` - register/login/me endpoints
- `backend/app/models/auth.py` - Pydantic schemas for auth requests/responses
- `backend/tests/__init__.py` - empty package marker
- `backend/tests/test_auth.py` - tests for auth module

### New files (frontend)
- `frontend/src/context/AuthContext.js` - auth state management
- `frontend/src/components/pages/LoginPage.js` - login/signup UI

### Modified files
- `backend/requirements.txt` - add python-jose, passlib
- `backend/.env` (project root `.env`) - add JWT_SECRET_KEY
- `backend/app/db/database.py` - add UserModel, add user_id to entries/goals
- `backend/app/db/crud/journal.py` - accept user_id param, filter queries
- `backend/app/db/crud/goal.py` - accept user_id param, filter queries
- `backend/app/db/crud/utils.py` - add user_id to get_goal_info
- `backend/app/routes/journal.py` - inject get_current_user, pass user_id to CRUD
- `backend/app/routes/goal.py` - inject get_current_user, pass user_id to CRUD
- `backend/app/routes/chatbot.py` - inject get_current_user
- `backend/app/routes/analytics.py` - inject get_current_user, pass user_id
- `backend/app/services/analytics.py` - accept user_id, pass to queries
- `backend/app/services/gemini_chatbot.py` - accept user_id, pass to CRUD calls
- `backend/app/main.py` - register auth router
- `frontend/src/api/api.js` - add auth header, add auth API calls
- `frontend/src/App.js` - wrap in AuthProvider, conditional render
- `frontend/src/components/layout/Sidebar.js` - add logout button

---

### Task 1: Backend dependencies and configuration

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `.env` (project root)

- [ ] **Step 1: Add auth dependencies to requirements.txt**

Add these two lines to the end of `backend/requirements.txt`:

```
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
```

Full file after edit:

```
fastapi>=0.68.0
uvicorn>=0.15.0
sqlalchemy>=1.4.23
pydantic>=1.8.2
python-dotenv>=0.19.0
google-genai>=1.25.0
numpy>=1.24.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
```

- [ ] **Step 2: Add JWT_SECRET_KEY to .env**

Add this line to the project root `.env` file (which already has GEMINI_API_KEY):

```
JWT_SECRET_KEY=reflecta-dev-secret-key-change-in-production
```

- [ ] **Step 3: Install new dependencies**

Run:
```bash
cd backend && uv pip install -r requirements.txt
```

Expected: Successfully installed python-jose and passlib with their extras.

- [ ] **Step 4: Commit**

Note: Do NOT commit `.env` (contains secrets). Only commit requirements.txt.

```bash
git add backend/requirements.txt
git commit -m "feat(auth): add python-jose and passlib dependencies"
```

---

### Task 2: UserModel and database schema changes

**Files:**
- Modify: `backend/app/db/database.py`

- [ ] **Step 1: Add UserModel and user_id foreign keys**

Replace the entire contents of `backend/app/db/database.py` with:

```python
"""
Database setup and SQLAlchemy models for the journal and goal application.
"""

import os
from datetime import datetime, timezone
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    Table,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'journal.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

journal_goal_association = Table(
    "journal_goal_association",
    Base.metadata,
    Column("journal_id", Integer, ForeignKey("journal_entries.id")),
    Column("goal_id", Integer, ForeignKey("goals.id"))
)


class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journal_entries = relationship("JournalEntryModel", back_populates="user")
    goals = relationship("GoalModel", back_populates="user")


class JournalEntryModel(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    sentiment_level = Column(Integer, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
    social_engagement = Column(Integer, nullable=True)

    formatted_content = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)
    sentiments = Column(String, nullable=True)

    user = relationship("UserModel", back_populates="journal_entries")
    goals = relationship(
        "GoalModel",
        secondary=journal_goal_association,
        back_populates="journal_entries"
    )


class GoalModel(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    target_date = Column(Date, nullable=True)
    category = Column(String, nullable=False)
    priority = Column(String, nullable=False, default="Low")
    description = Column(Text, nullable=True)
    progress = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    user = relationship("UserModel", back_populates="goals")
    journal_entries = relationship(
        "JournalEntryModel",
        secondary=journal_goal_association,
        back_populates="goals"
    )


def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: Delete existing database**

Since we're starting fresh (no migration needed):

```bash
rm -f backend/app/db/journal.db
```

- [ ] **Step 3: Verify tables create cleanly**

```bash
cd backend && uv run python -c "from app.db.database import create_tables; create_tables()"
```

Expected: "Creating database tables..." then "Tables created." with no errors.

- [ ] **Step 4: Commit**

```bash
git add backend/app/db/database.py
git commit -m "feat(auth): add UserModel, add user_id FK to entries and goals"
```

---

### Task 3: Auth module - passwords and tokens

**Files:**
- Create: `backend/app/auth/__init__.py`
- Create: `backend/app/auth/passwords.py`
- Create: `backend/app/auth/tokens.py`

- [ ] **Step 1: Create auth package**

```bash
mkdir -p backend/app/auth
```

- [ ] **Step 2: Create `backend/app/auth/__init__.py`**

```python
```

(Empty file)

- [ ] **Step 3: Create `backend/app/auth/passwords.py`**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

- [ ] **Step 4: Create `backend/app/auth/tokens.py`**

```python
import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-dev-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT. Raises JWTError on failure."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

- [ ] **Step 5: Verify modules import cleanly**

```bash
cd backend && uv run python -c "from app.auth.passwords import hash_password, verify_password; from app.auth.tokens import create_access_token, decode_access_token; print('OK')"
```

Expected: "OK"

- [ ] **Step 6: Commit**

```bash
git add backend/app/auth/
git commit -m "feat(auth): add password hashing and JWT token utilities"
```

---

### Task 4: Auth dependencies and Pydantic schemas

**Files:**
- Create: `backend/app/auth/dependencies.py`
- Create: `backend/app/models/auth.py`

- [ ] **Step 1: Create `backend/app/models/auth.py`**

```python
from datetime import datetime
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
```

- [ ] **Step 2: Create `backend/app/auth/dependencies.py`**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.tokens import decode_access_token
from app.db.database import get_db, UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
```

- [ ] **Step 3: Verify imports**

```bash
cd backend && uv run python -c "from app.auth.dependencies import get_current_user; from app.models.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse; print('OK')"
```

Expected: "OK"

- [ ] **Step 4: Commit**

```bash
git add backend/app/auth/dependencies.py backend/app/models/auth.py
git commit -m "feat(auth): add auth dependency and Pydantic schemas"
```

---

### Task 5: Auth routes

**Files:**
- Create: `backend/app/routes/auth.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create `backend/app/routes/auth.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.passwords import hash_password, verify_password
from app.auth.tokens import create_access_token
from app.auth.dependencies import get_current_user
from app.models.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = UserModel(
        email=request.email,
        hashed_password=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user
```

- [ ] **Step 2: Register auth router in main.py**

In `backend/app/main.py`, add the import and router registration.

Change the import line:
```python
from app.routes import journal, goal, chatbot, analytics
```
to:
```python
from app.routes import auth, journal, goal, chatbot, analytics
```

Add the router registration before the existing ones:
```python
app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(goal.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)
```

- [ ] **Step 3: Verify server starts**

```bash
cd backend && uv run uvicorn app.main:app --host 127.0.0.1 --port 8001 &
sleep 2
curl -s http://127.0.0.1:8001/docs | head -20
kill %1
```

Expected: HTML output from FastAPI docs page (no import errors).

- [ ] **Step 4: Test register and login**

```bash
cd backend && uv run uvicorn app.main:app --host 127.0.0.1 --port 8001 &
sleep 2

# Register
curl -s -X POST http://127.0.0.1:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Login
curl -s -X POST http://127.0.0.1:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

kill %1
```

Expected: Both return `{"access_token": "...", "token_type": "bearer"}`

- [ ] **Step 5: Commit**

```bash
git add backend/app/routes/auth.py backend/app/main.py
git commit -m "feat(auth): add register, login, and me endpoints"
```

---

### Task 6: Protect existing routes and modify CRUD

**Files:**
- Modify: `backend/app/db/crud/journal.py`
- Modify: `backend/app/db/crud/goal.py`
- Modify: `backend/app/routes/journal.py`
- Modify: `backend/app/routes/goal.py`
- Modify: `backend/app/routes/chatbot.py`
- Modify: `backend/app/routes/analytics.py`
- Modify: `backend/app/services/analytics.py`

- [ ] **Step 1: Modify journal CRUD to accept user_id**

Replace `backend/app/db/crud/journal.py` with:

```python
"""
CRUD operations for journal entries.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.database import JournalEntryModel
from app.db.crud.utils import get_goal_info, get_goals
from app.models.entry_goal import JournalEntryCreate, JournalEntryUpdate
from app.services.gemini_agent import analyze_entry


def get_journal_entries(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
) -> List[JournalEntryModel]:
    query = db.query(JournalEntryModel).filter(
        JournalEntryModel.user_id == user_id
    )

    if from_date:
        query = query.filter(JournalEntryModel.date >= from_date)
    if to_date:
        query = query.filter(JournalEntryModel.date <= to_date)

    return query.order_by(
        JournalEntryModel.date.desc(),
        JournalEntryModel.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_journal_entry(
    db: Session, entry_id: int, user_id: int
) -> Optional[JournalEntryModel]:
    return db.query(JournalEntryModel).filter(
        JournalEntryModel.id == entry_id,
        JournalEntryModel.user_id == user_id,
    ).first()


def create_journal_entry(
    db: Session, entry: JournalEntryCreate, user_id: int
) -> JournalEntryModel:
    goal_info = get_goal_info(db, user_id)
    formatted_content, activities, sentiments, goal_ids = analyze_entry(
        entry.content, goal_info
    )
    goals = get_goals(db, goal_ids)

    db_entry = JournalEntryModel(
        user_id=user_id,
        title=entry.title,
        date=entry.date,
        content=entry.content,
        sentiment_level=(
            entry.sentiment_level.value
            if entry.sentiment_level is not None
            else None
        ),
        sleep_quality=(
            entry.sleep_quality.value
            if entry.sleep_quality is not None
            else None
        ),
        stress_level=(
            entry.stress_level.value
            if entry.stress_level is not None
            else None
        ),
        social_engagement=(
            entry.social_engagement.value
            if entry.social_engagement is not None
            else None
        ),
        formatted_content=formatted_content,
        activities=activities,
        sentiments=sentiments,
        goals=goals,
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def update_journal_entry(
    db: Session,
    entry_id: int,
    entry_update: JournalEntryUpdate,
    user_id: int,
) -> Optional[JournalEntryModel]:
    db_entry = get_journal_entry(db, entry_id, user_id)
    if db_entry:
        update_data: dict = entry_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key in ['sentiment_level', 'sleep_quality', 'stress_level',
                       'social_engagement'] and value is not None:
                setattr(db_entry, key, value.value)
            else:
                setattr(db_entry, key, value)

        if entry_update.content:
            goal_info = get_goal_info(db, user_id)
            formatted, activities, sentiments, goal_ids = analyze_entry(
                entry_update.content, goal_info
            )
            goals = get_goals(db, goal_ids)

            db_entry.formatted_content = formatted
            db_entry.activities = activities
            db_entry.sentiments = sentiments
            db_entry.goals.clear()
            db_entry.goals.extend(goals)

        db_entry.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_entry)
    return db_entry


def delete_journal_entry(db: Session, entry_id: int, user_id: int) -> bool:
    db_entry = get_journal_entry(db, entry_id, user_id)
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False
```

- [ ] **Step 2: Modify `backend/app/db/crud/utils.py` to accept user_id for goal_info**

Change the `get_goal_info` function from:

```python
def get_goal_info(db: Session) -> List[dict]:
    goal_info = [
        {"id": goal.id, "title": goal.title, "description": goal.description}
        for goal in db.query(GoalModel).all()
    ]
    return goal_info
```

To:

```python
def get_goal_info(db: Session, user_id: int) -> List[dict]:
    goal_info = [
        {"id": goal.id, "title": goal.title, "description": goal.description}
        for goal in db.query(GoalModel).filter(GoalModel.user_id == user_id).all()
    ]
    return goal_info
```

- [ ] **Step 3: Modify goal CRUD to accept user_id**

Replace `backend/app/db/crud/goal.py` with:

```python
"""
CRUD operations for goals.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload

from app.db.database import GoalModel
from app.db.crud.utils import get_recent_entries
from app.models.entry_goal import GoalCreate, GoalUpdate, GoalPriority


def get_goals(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    max_entries_per_goal: int = 5
) -> List[GoalModel]:
    goals_with_entries = (
        db.query(GoalModel)
        .filter(GoalModel.user_id == user_id)
        .options(joinedload(GoalModel.journal_entries))
        .order_by(
            case(
                (GoalModel.priority == GoalPriority.HIGH.value, 1),
                (GoalModel.priority == GoalPriority.MEDIUM.value, 2),
                (GoalModel.priority == GoalPriority.LOW.value, 3),
                else_=4
            )
        ).offset(skip)
        .limit(limit)
        .all()
    )
    return get_recent_entries(
        goals_with_entries,
        max_entries_per_goal
    )


def get_goal(
        db: Session,
        goal_id: int,
        user_id: int,
        max_entries_per_goal: int = 5
) -> Optional[GoalModel]:
    goal = (
        db.query(GoalModel)
        .filter(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        .options(joinedload(GoalModel.journal_entries))
        .one_or_none()
    )
    if goal:
        filtered_goal_list = get_recent_entries([goal], max_entries_per_goal)
        return filtered_goal_list[0]
    return None


def create_goal(db: Session, goal: GoalCreate, user_id: int) -> GoalModel:
    db_goal = GoalModel(
        user_id=user_id,
        title=goal.title,
        type=goal.type,
        target_date=goal.target_date,
        category=goal.category,
        priority=goal.priority.value,
        description=goal.description,
        progress=0
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def update_goal(
    db: Session,
    goal_id: int,
    goal_update: GoalUpdate,
    user_id: int,
) -> Optional[GoalModel]:
    db_goal = get_goal(db, goal_id, user_id)
    if db_goal:
        update_data: dict = goal_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key == 'priority' and value is not None:
                setattr(db_goal, key, value.value)
            else:
                setattr(db_goal, key, value)

        db_goal.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    db_goal = get_goal(db, goal_id, user_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
```

- [ ] **Step 4: Modify journal routes to require auth**

Replace `backend/app/routes/journal.py` with:

```python
"""
API routes for managing journal entries.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.db.crud.journal import (
    create_journal_entry,
    get_journal_entry,
    get_journal_entries,
    update_journal_entry,
    delete_journal_entry
)
from app.models.entry_goal import (
    JournalEntryCreate,
    JournalEntry,
    JournalEntryUpdate
)

router = APIRouter(
    prefix="/journal",
    tags=["journal"],
    responses={404: {"description": "Not found"}},
)


@router.get("/entries/", response_model=List[JournalEntry])
def read_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    entries = get_journal_entries(db, current_user.id, skip=skip, limit=limit)
    return [
        JournalEntry.model_validate(entry, from_attributes=True)
        for entry in entries
    ]


@router.get("/entries/{entry_id}", response_model=JournalEntry)
def read_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = get_journal_entry(db, entry_id, current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.post("/entries/", response_model=JournalEntry)
def create_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = create_journal_entry(db, entry, current_user.id)
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.put("/entries/{entry_id}", response_model=JournalEntry)
def update_entry(
    entry_id: int,
    entry_update: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_entry = update_journal_entry(db, entry_id, entry_update, current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JournalEntry.model_validate(db_entry, from_attributes=True)


@router.delete("/entries/{entry_id}", response_model=dict)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    success = delete_journal_entry(db, entry_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": f"Journal entry with id {entry_id} deleted successfully"}
```

- [ ] **Step 5: Modify goal routes to require auth**

Replace `backend/app/routes/goal.py` with:

```python
"""
API routes for managing goals.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.db.crud.goal import (
    create_goal,
    get_goal,
    get_goals,
    update_goal,
    delete_goal
)
from app.db.crud.journal import get_journal_entries
from app.models.entry_goal import GoalCreate, Goal, GoalUpdate
from app.models.chat_agent import EnhanceDescriptionRequest
from app.services.gemini_agent import (
    recommend_goals,
    RecommendedGoal,
    enhance_goal_description,
)


router = APIRouter(
    prefix="/goals",
    tags=["goals"],
    responses={404: {"description": "Goal not found"}},
)


@router.get("/", response_model=List[Goal])
def read_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return get_goals(db, current_user.id, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=Goal)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_goal = get_goal(db, goal_id, current_user.id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.post("/", response_model=Goal)
def create_goal_route(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return create_goal(db, goal, current_user.id)


@router.put("/{goal_id}", response_model=Goal)
def update_goal_route(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_goal = update_goal(db, goal_id, goal_update, current_user.id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.delete("/{goal_id}", response_model=dict)
def delete_goal_route(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    success = delete_goal(db, goal_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": f"Goal with id {goal_id} deleted successfully"}


@router.post("/recommend", response_model=List[RecommendedGoal])
def recommend_new_goals(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    entries = get_journal_entries(db, current_user.id)
    if not entries:
        return []
    entry_content = "\n\n".join([entry.content for entry in entries])
    recommendations = recommend_goals(entry_content)
    return recommendations


@router.post("/enhance-description", response_model=str)
def enhance_description_endpoint(
    request: EnhanceDescriptionRequest,
    current_user: UserModel = Depends(get_current_user),
):
    enhanced_description = enhance_goal_description(
        title=request.title,
        description=request.description
    )
    return enhanced_description
```

- [ ] **Step 6: Modify chatbot routes to require auth**

Replace `backend/app/routes/chatbot.py` with:

```python
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
```

Note: The chatbot service (`gemini_chatbot.py`) calls `get_journal_entries` internally. It needs to be updated to pass `user_id`. Modify the `get_contextual_chatbot_response` function signature to accept `user_id: int` and pass it through to `get_journal_entries`.

- [ ] **Step 7: Modify analytics routes to require auth**

Replace `backend/app/routes/analytics.py` with:

```python
"""
API routes for analytics.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db, UserModel
from app.auth.dependencies import get_current_user
from app.models.analytics import TsTrends, Averages
from app.services.analytics import AnalyticsService
from app.services.gemini_agent import summarize_journal_entries
from app.utils.analytics import parse_period_to_days


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/trends/", response_model=TsTrends)
def get_trends(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_trends(past_days)


@router.get("/stats/", response_model=Averages)
def get_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_averages(past_days)


@router.get("/correlations/")
def get_correlations(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    analytics_service = AnalyticsService(db, current_user.id)
    return analytics_service.calculate_correlations(past_days)


@router.get("/summary/")
def generate_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    period: str = Query("30days"),
):
    past_days = parse_period_to_days(period)
    to_date = datetime.now()
    from_date = to_date - timedelta(days=past_days)

    analytics_service = AnalyticsService(db, current_user.id)
    entry_details = analytics_service.prepare_summary_data(from_date, to_date)

    if not entry_details:
        return {"summary": "No journal entries found for the specified period."}

    summary = summarize_journal_entries("\n".join(entry_details))
    return {"summary": summary}
```

- [ ] **Step 8: Modify AnalyticsService to accept user_id**

In `backend/app/services/analytics.py`, change the `__init__` method to accept `user_id`:

```python
class AnalyticsService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
```

Then update every call to `get_journal_entries` within the class to pass `self.user_id` as the second argument:

- `calculate_trends`: `get_journal_entries(self.db, self.user_id, from_date=cutoff_date)`
- `calculate_averages`: `get_journal_entries(self.db, self.user_id, from_date=cutoff_date)`
- `calculate_correlations`: `get_journal_entries(self.db, self.user_id, from_date=cutoff_date)`
- `prepare_summary_data`: `get_journal_entries(self.db, self.user_id, from_date=from_date, to_date=to_date)`
- `_calculate_current_streak`: `get_journal_entries(self.db, self.user_id, from_date=cutoff_date)`

- [ ] **Step 9: Update gemini_chatbot.py to accept user_id**

In `backend/app/services/gemini_chatbot.py`, change the function signature and both CRUD calls:

Change:
```python
def get_contextual_chatbot_response(user_message: str, db: Session) -> str:
    goals = get_goals(db, limit=10)
    journal_entries = get_journal_entries(db, limit=10)
```

To:
```python
def get_contextual_chatbot_response(user_message: str, db: Session, user_id: int) -> str:
    goals = get_goals(db, user_id, limit=10)
    journal_entries = get_journal_entries(db, user_id, limit=10)
```

The rest of the function body stays the same.

- [ ] **Step 10: Verify server starts with all changes**

```bash
cd backend && rm -f app/db/journal.db && uv run python -c "from app.db.database import create_tables; create_tables()" && uv run uvicorn app.main:app --host 127.0.0.1 --port 8001 &
sleep 2
curl -s http://127.0.0.1:8001/ | python3 -m json.tool
kill %1
```

Expected: `{"message": "Welcome to the Reflecta API!"}`

- [ ] **Step 11: Commit**

```bash
git add backend/app/db/crud/ backend/app/routes/ backend/app/services/analytics.py backend/app/services/gemini_chatbot.py
git commit -m "feat(auth): protect all routes with JWT auth, filter data by user_id"
```

---

### Task 7: Frontend AuthContext and API updates

**Files:**
- Create: `frontend/src/context/AuthContext.js`
- Modify: `frontend/src/api/api.js`

- [ ] **Step 1: Create `frontend/src/context/AuthContext.js`**

```javascript
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const register = async (email, password) => {
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Registration failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

- [ ] **Step 2: Update `frontend/src/api/api.js` to include auth headers**

Add a helper function at the top of `api.js` (after the `API_BASE_URL` constant) and update all fetch calls:

```javascript
const API_BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const authFetch = async (url, options = {}) => {
  const headers = { ...getAuthHeaders(), ...options.headers };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  return response;
};
```

Then replace every `fetch(...)` call in the file with `authFetch(...)`, and remove inline `headers: { "Content-Type": "application/json" }` objects since `authFetch` handles them.

For example, `fetchJournalEntries` becomes:
```javascript
export const fetchJournalEntries = async () => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/`);
  const data = await handleResponse(response);
  const sortedEntries = data.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  return sortedEntries;
};
```

And `createJournalEntry` becomes:
```javascript
export const createJournalEntry = async (entryData) => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/`, {
    method: "POST",
    body: JSON.stringify(entryData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};
```

Apply the same pattern to ALL fetch calls in the file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/AuthContext.js frontend/src/api/api.js
git commit -m "feat(auth): add AuthContext and attach JWT to all API requests"
```

---

### Task 8: Login page

**Files:**
- Create: `frontend/src/components/pages/LoginPage.js`

- [ ] **Step 1: Create `frontend/src/components/pages/LoginPage.js`**

```javascript
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 60"
            className="h-14 w-auto mx-auto mb-4"
          >
            <defs>
              <linearGradient
                id="purpleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9B30FF" />
                <stop offset="100%" stopColor="#6A0DAD" />
              </linearGradient>
            </defs>
            <g>
              <rect
                x="10"
                y="10"
                width="40"
                height="40"
                rx="10"
                ry="10"
                fill="url(#purpleGradient)"
              />
              <line
                x1="30"
                y1="10"
                x2="30"
                y2="50"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <path
                d="M20 25 Q 25 18, 30 25 Q 35 32, 40 25"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M20 35 Q 25 42, 30 35 Q 35 28, 40 35"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />
            </g>
            <text
              x="60"
              y="38"
              fontFamily="'DM Serif Display', serif"
              fontWeight="400"
              fontSize="24"
              fill="#171717"
            >
              Reflecta
            </text>
          </svg>
          <p className="text-gray-500 text-sm">Your AI-powered journal</p>
        </div>

        <div className="card p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                isLogin
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                !isLogin
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pages/LoginPage.js
git commit -m "feat(auth): add login/signup page"
```

---

### Task 9: App.js integration and Sidebar logout

**Files:**
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/components/layout/Sidebar.js`

- [ ] **Step 1: Update `frontend/src/App.js`**

Replace `frontend/src/App.js` with:

```javascript
import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import FloatingAIButton from "./components/ai/AIButton";
import JournalPage from "./components/pages/JournalPage";
import CalendarPage from "./components/pages/CalendarPage";
import GoalPage from "./components/pages/GoalPage";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import AIChat from "./components/ai/AIChat";
import LoginPage from "./components/pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState("journal");
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />

        <main className="flex-1 flex overflow-hidden">
          <div
            className={`flex-1 overflow-y-auto p-8 ${
              showAIChat ? "md:pr-4" : ""
            }`}
          >
            {activeTab === "journal" && <JournalPage />}
            {activeTab === "goals" && <GoalPage />}
            {activeTab === "calendar" && <CalendarPage />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
          </div>

          {showAIChat && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative">
                <AIChat onClose={() => setShowAIChat(false)} />
              </div>
            </div>
          )}
        </main>

        <div className="fixed bottom-6 right-6 z-40">
          <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: Add logout button to Sidebar**

Replace `frontend/src/components/layout/Sidebar.js` with:

```javascript
import React from "react";
import { BookOpen, Calendar, CheckSquare, BarChart, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: "journal", icon: BookOpen, label: "Journal" },
    { id: "goals", icon: CheckSquare, label: "Goals" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "analytics", icon: BarChart, label: "Analytics" },
  ];

  return (
    <div className="w-16 md:w-64 bg-gray-50 flex flex-col">
      <div className="px-4 py-5 flex items-center justify-center md:justify-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 60"
          className="h-10 md:h-12 w-auto"
        >
          <defs>
            <linearGradient
              id="purpleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#9B30FF" />
              <stop offset="100%" stopColor="#6A0DAD" />
            </linearGradient>
          </defs>

          <g>
            <rect
              x="10"
              y="10"
              width="40"
              height="40"
              rx="10"
              ry="10"
              fill="url(#purpleGradient)"
            />
            <line
              x1="30"
              y1="10"
              x2="30"
              y2="50"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M20 25 Q 25 18, 30 25 Q 35 32, 40 25"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M20 35 Q 25 42, 30 35 Q 35 28, 40 35"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
          </g>

          <text
            x="60"
            y="38"
            fontFamily="'DM Serif Display', serif"
            fontWeight="400"
            fontSize="24"
            fill="#171717"
          >
            Reflecta
          </text>
        </svg>
      </div>

      <nav className="flex-1 pt-4 px-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center w-full p-3 mb-1 rounded-xl transition-all duration-150 ${
              activeTab === id
                ? "bg-purple-100 text-purple-700 font-medium"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Icon className="h-5 w-5 mx-auto md:mx-0 md:mr-3" />
            <span className="hidden md:inline text-sm">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 mx-auto md:mx-0 md:mr-3" />
          <span className="hidden md:inline text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
```

- [ ] **Step 3: Verify frontend compiles**

```bash
cd frontend && npm run build
```

Expected: "Compiled successfully." with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.js frontend/src/components/layout/Sidebar.js
git commit -m "feat(auth): integrate auth into App shell with login gate and logout"
```

---

### Task 10: End-to-end verification

- [ ] **Step 1: Delete DB and restart backend**

```bash
rm -f backend/app/db/journal.db
cd backend && uv run uvicorn app.main:app --reload --port 8000
```

- [ ] **Step 2: Start frontend**

```bash
cd frontend && npm start
```

- [ ] **Step 3: Test full flow in browser**

1. Open http://localhost:3000 - should see login page
2. Click "Sign Up" tab, enter email + password, submit - should redirect to main app
3. Create a journal entry - should work
4. Click logout in sidebar - should return to login page
5. Log back in with same credentials - should see the entry you created

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "feat(auth): complete user management implementation"
```
