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
