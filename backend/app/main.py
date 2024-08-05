import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.routers import users, matches, statistics, auth, register
from app.database.database import Base, engine

# Load environment variables
load_dotenv()

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

static_path = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Configure CORS
frontend_url = "FRONTEND_URL"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(statistics.router)
app.include_router(register.router)
