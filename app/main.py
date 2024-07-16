from fastapi import FastAPI
from app.routers import users, matches, statistics, auth
from app.database.database import Base, engine

app = FastAPI()

# Include your routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(statistics.router)

Base.metadata.create_all(bind=engine)
