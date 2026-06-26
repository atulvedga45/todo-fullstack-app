from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# IMPORTANT

from app.routers import todos
from app.routers import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5178",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5178",

    "https://todo-fullstack-app-murex.vercel.app",
    "https://todo-fullstack-3x38ba7jh-vedgaatul730-3497s-projects.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(todos.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Todo API Running Successfully"
    }
