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
import os
from datetime import datetime, timezone

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Create the database file in the same directory
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'journal.db')}"

# check_same_thread=False is required for SQLite to allow multiple
# threads to use the same connection
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for many-to-many relationship between
# JournalEntryModel and GoalModel
journal_goal_association = Table(
    "journal_goal_association",
    Base.metadata,
    Column("journal_id", Integer, ForeignKey("journal_entries.id")),
    Column("goal_id", Integer, ForeignKey("goals.id"))
)


class JournalEntryModel(Base):
    """Model for journal entries."""

    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)

    # Main fields
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    content = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    # State tracking fields (stored as Integer)
    sentiment_level = Column(Integer, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
    social_engagement = Column(Integer, nullable=True)

    # AI-generated analysis fields
    formatted_content = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)  # Stored as JSON string
    sentiments = Column(String, nullable=True)
    keywords = Column(Text, nullable=True)  # Stored as JSON string

    # Many-to-many relationship with goals
    goals = relationship(
        "GoalModel",  # target model
        secondary=journal_goal_association,  # association table
        back_populates="journal_entries"  # "two-way" mirror
    )


class GoalModel(Base):
    """Model for goals."""

    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)

    # Main fields
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'One-time' or 'Recurring'
    target_date = Column(Date, nullable=True)  # Date for one-time goals
    category = Column(String, nullable=False)  # Category of the goal
    priority = Column(String, nullable=False, default="Low")
    description = Column(Text, nullable=True)
    progress = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    # Many-to-many relationship with journal entries
    journal_entries = relationship(
        "JournalEntryModel",  # target model
        secondary=journal_goal_association,  # association table
        back_populates="goals"  # "two-way" mirror
    )


# Create the database tables
def create_tables():
    # This will create the new tables and columns.
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
