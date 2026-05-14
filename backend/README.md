## Advanced Programming Project – Backend API

This is the backend component of the Advanced Programming Project. It is built with FastAPI and serves a RESTful API for journal entries and agent-based services.

## Project Structure

```
backend/
├── app/
│   ├── db/         # Database setup, connection, and CRUD operations
│   ├── models/     # Pydantic models for data validation and serialization
│   ├── routes/     # API endpoint definitions
│   ├── services/   # Business logic and services (e.g., AI agents)
│   ├── utils/      # Utility functions and helpers
│   └── main.py     # FastAPI application entry point
├── Dockerfile      # Docker configuration for the backend
├── README.md       # This file
└── requirements.txt# Python dependencies
```

## Setup Instructions

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **(Recommended) Create and activate a virtual environment:**

- **Linux/MacOS:**
```bash
python -m venv .venv
source .venv/bin/activate
```
- **Windows:**
```bash
python -m venv .venv
.\.venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Create a `.env` file:**
Create a `.env` file in the `backend` directory with the following content:
```
GEMINI_API_KEY=your_api_key
```
Replace your_api_key with your actual Gemini API key. Get your API key here:
[Gemini API Key](https://ai.google.dev/gemini-api/docs/api-key).

## Run the API locally

Use the following command to start the FastAPI server with live reload (for development purposes):
```bash
uvicorn app.main:app --reload
```

- The API will be available at: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger UI (API docs): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## License

This project is for educational purposes.
