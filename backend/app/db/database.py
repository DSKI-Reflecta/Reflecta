from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timezone
from ..models.entry import SentimentLevel, SleepQuality, StressLevel, SocialEngagement

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Create the database file in the same directory
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'journal.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class JournalEntryModel(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    # State tracking fields
    sentiment_level = Column(Integer, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
    social_engagement = Column(Integer, nullable=True)

    # AI-generated analysis fields
    formatted_content = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)  # Stored as JSON string
    sentiment_analysis = Column(String, nullable=True)
    keywords = Column(Text, nullable=True)  # Stored as JSON string


# Create the database tables
def create_tables():
    Base.metadata.create_all(bind=engine)


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()