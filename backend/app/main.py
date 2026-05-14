from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import journal, goal  # Import routers
from .db.database import create_tables

# Create the FastAPI app
app = FastAPI(
    title="Reflecta API",
    description="API for a smart AI-driven journal, reflection assistant, "
                "and goal tracker",
    version="0.1.0",
)

# CORS configuration to allow frontend calls from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(journal.router)
app.include_router(goal.router)


@app.on_event("startup")
def startup_event() -> None:
    """Create database tables on startup"""
    create_tables()


@app.get("/")
def read_root() -> dict:
    """Test root endpoint"""
    return {"message": "Welcome to the Reflecta API"}
