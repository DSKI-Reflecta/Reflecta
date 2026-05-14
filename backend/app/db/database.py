from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Enum, Float, Date # Import Date, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timezone
# Import the enums if needed for column types, although Integer is used below
# from ..models.entry import SentimentLevel, SleepQuality, StressLevel, SocialEngagement

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Create the database file in the same directory
# Consider using a separate database file for goals or a more robust approach for production
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'journal.db')}" # Using the same db file for simplicity

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Existing JournalEntryModel
class JournalEntryModel(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    # Added title and date columns
    title = Column(String, nullable=False) # Store title as String
    date = Column(Date, nullable=False)   # Store date as Date type

    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)

    # State tracking fields (stored as Integer as per your model)
    sentiment_level = Column(Integer, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
    social_engagement = Column(Integer, nullable=True)

    # AI-generated analysis fields
    formatted_content = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)  # Stored as JSON string
    sentiment_analysis = Column(String, nullable=True)
    keywords = Column(Text, nullable=True)  # Stored as JSON string

# New GoalModel
class GoalModel(Base):
    __tablename__ = "goals" # Table name for goals

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # e.g., 'One-time', 'Recurring'
    # Make targetDate nullable
    targetDate = Column(Date, nullable=True) # Store as Date type, now nullable
    category = Column(String, nullable=False)
    # Store priority as a String column
    priority = Column(String, nullable=False, default="Low") # Default to "Low"
    description = Column(Text, nullable=True)
    progress = Column(Integer, nullable=False, default=0) # Store progress as Integer, default 0
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=True)


# Create the database tables
def create_tables():
    # This will create the new tables and columns.
    # If the tables already exist, you'll need to handle schema migrations (e.g., using Alembic).
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

