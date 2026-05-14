# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reflecta is an AI-powered journaling application with journal entries, goal tracking, analytics, a calendar view, and a chatbot assistant. It uses Gemini (gemini-2.0-flash) for AI features: entry formatting, activity/sentiment extraction, goal matching, and conversational support.

## Development Commands

### Full stack (Docker)
```bash
docker-compose up --build
```
Frontend: http://localhost:3000 | Backend: http://localhost:8000 | API docs: http://localhost:8000/docs

### Backend (local)
```bash
cd backend
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (local)
```bash
cd frontend
npm install
npm start
```

### Tests
```bash
cd frontend && npm test          # React tests (jest)
cd frontend && npm test -- --watchAll=false  # single run
```

## Environment

Requires a `.env` file in the project root (copy from `example.env`):
```
GEMINI_API_KEY=<your_api_key>
```

## Architecture

### Backend (FastAPI + SQLAlchemy + SQLite)

- `app/main.py` - FastAPI app, CORS config (allows localhost:3000), router registration
- `app/routes/` - API endpoints: journal, goal, chatbot (`/ai/`), analytics
- `app/services/gemini_agent.py` - All Gemini AI calls for entry analysis (formatting, activities, sentiments, goal extraction run concurrently via ThreadPoolExecutor)
- `app/services/gemini_chatbot.py` - Context-aware chatbot that injects recent entries + goals into the system prompt
- `app/db/database.py` - SQLAlchemy models (JournalEntryModel, GoalModel) with many-to-many relationship via journal_goal_association table
- `app/db/crud/` - Database operations (journal.py, goal.py, utils.py)
- `app/models/` - Pydantic schemas for request/response validation and Gemini structured output schemas
- `app/utils/analytics.py` - Analytics computation (trends, correlations, streaks)

Database is SQLite stored at `backend/app/db/journal.db`. Tables are auto-created on startup via the lifespan handler.

### Frontend (React + Tailwind CSS + TanStack Query)

- `src/api/api.js` - Single API client module; all backend calls go through here (base URL: localhost:8000)
- `src/components/pages/` - Top-level page components: JournalPage, GoalPage, CalendarPage, AnalyticsPage
- `src/components/` - Feature-grouped components: ai/, analytics/, calendar/, goals/, journal/, layout/, common/
- `src/App.js` - Main app component with routing/layout

### Key Data Flow

1. Journal entry creation: user writes content -> POST to `/journal/entries/` -> backend calls `analyze_entry()` which concurrently runs 4 Gemini calls (format, activities, sentiments, goals) -> stores everything in SQLite
2. Chatbot: POST to `/ai/chat/` -> loads last 10 entries + goals as context -> sends to Gemini with system prompt -> returns response
3. Analytics: computed server-side from stored entry metadata (sentiment_level, sleep_quality, stress_level, social_engagement fields)

### API Route Prefixes

- `/journal/` - CRUD for journal entries
- `/goals/` - CRUD for goals + AI enhance/recommend endpoints
- `/ai/` - Chatbot and journal question generation
- `/analytics/` - Summary, trends, correlations, stats (all accept `?period=` param)
