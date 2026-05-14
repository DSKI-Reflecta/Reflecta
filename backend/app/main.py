from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import journal, goal # Import the new goal router
from .db.database import create_tables

# Create the FastAPI app
app = FastAPI(
    title="Smart Journal & Goals API", # Updated title
    description="API for a smart AI-driven journal, reflection assistant, and goal tracker", # Updated description
    version="0.1.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(journal.router)
app.include_router(goal.router) # Include the new goal router

# Create database tables on startup
@app.on_event("startup")
def startup_event():
    create_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Journal & Goals API"} # Updated message

