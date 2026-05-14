## Advanced Programming Project – Backend API

This is the backend component of the Advanced Programming Project. It is built with FastAPI and serves a RESTful API for journal entries and agent-based services.

## Project Structure

```
backend/
├── app/
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── main.py
└── requirements.txt
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

## Run the API locally

Use the following command to start the FastAPI server with live reload:

```bash
uvicorn app.main:app --reload
```

- The API will be available at: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger UI (API docs): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## License

This project is for educational purposes.
```
