from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas, crud
from database import engine, SessionLocal


# Create the database tables
models.Base.metadata.create_all(bind=engine)


# Initialize FastAPI
app = FastAPI()


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


#@app.get("/users/{user_id}/matches", response_model=List[schemas.Match])
def read_user_matches(user_id: int, db: Session = Depends(get_db)):
    user_matches = crud.get_user_matches(db=db, user_id=user_id)
    if user_matches is None:
        raise HTTPException(status_code=404, detail="Matches not found for this user")
    return user_matches


# Match endpoints
@app.post("/matches/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db)):
    return crud.create_match(db=db, match=match)


@app.get("/matches/", response_model=list[schemas.Match])
def read_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    matches = crud.get_matches(db, skip=skip, limit=limit)
    return matches


@app.get("/matches/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match