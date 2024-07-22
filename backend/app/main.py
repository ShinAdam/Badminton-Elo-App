import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from app.routers import users, matches, statistics, auth
from app.database.database import Base, engine

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# Correct the path and ensure the directory exists
static_path = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_path, exist_ok=True)

# Mount the static files directory
app.mount("/static", StaticFiles(directory=static_path), name="static")


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods, e.g., GET, POST
    allow_headers=["*"],  # Allows all headers
)

# Include your routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(statistics.router)

@app.get("/list-static-files")
def list_static_files():
    static_dir = "backend/static/profile_pics"
    files = os.listdir(static_dir)
    return {"files": files}