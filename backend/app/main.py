from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import journal, goal, chatbot, analytics
from app.db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event for FastAPI app"""
    create_tables()
    yield
    # optional shutdown code here


# Create the FastAPI app
app = FastAPI(
    title="Reflecta API",
    description="API for a smart AI-driven journal, reflection assistant, "
                "and goal tracker",
    version="0.1.0",
    lifespan=lifespan,
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
app.include_router(chatbot.router)
app.include_router(analytics.router)


@app.get("/")
def read_root() -> dict:
    """Test root endpoint"""
    return {"message": "Welcome to the Reflecta API"}
