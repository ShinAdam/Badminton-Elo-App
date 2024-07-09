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
    db_users = crud.get_users(db, skip=skip, limit=limit)
    if db_users is None:
        raise HTTPException(status_code=404, detail="Match not found")    
    
    # Convert the User objects in winners and losers to their IDs for each match
    response_users = []
    for user in db_users:
        response_user = schemas.User(
            id=user.id,
            username=user.username,
            rating=user.rating,
            matches_won=[match.id for match in user.matches_won],
            matches_lost=[match.id for match in user.matches_lost]
        )
        response_users.append(response_user)
    
    return response_users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_user = schemas.User(
        id=db_user.id,
        username=db_user.username,
        rating=db_user.rating,
        matches_won=[match.id for match in db_user.matches_won],
        matches_lost=[match.id for match in db_user.matches_lost]
    )
    return response_user


@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db=db, user_id=user_id, user_data=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_user = schemas.User(
        id=db_user.id,
        username=db_user.username,
        rating=db_user.rating,
        matches_won=[match.id for match in db_user.matches_won],
        matches_lost=[match.id for match in db_user.matches_lost]
    )
    return response_user


@app.delete("/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_user = schemas.User(
        id=db_user.id,
        username=db_user.username,
        rating=db_user.rating,
        matches_won=[match.id for match in db_user.matches_won],
        matches_lost=[match.id for match in db_user.matches_lost]
    )
    return response_user


#@app.get("/users/{user_id}/matches", response_model=List[schemas.Match])
def read_user_matches(user_id: int, db: Session = Depends(get_db)):
    user_matches = crud.get_user_matches(db=db, user_id=user_id)
    if user_matches is None:
        raise HTTPException(status_code=404, detail="Matches not found for this user")
    return user_matches


# Match endpoints
@app.post("/matches/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db)):
    db_match = crud.create_match(db=db, match=match)
    
    # Convert the User objects in winners and losers to their IDs
    response_match = schemas.Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match


@app.get("/matches/", response_model=list[schemas.Match])
def read_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_matches = crud.get_matches(db, skip=skip, limit=limit)
    if db_matches is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs for each match
    response_matches = []
    for match in db_matches:
        response_match = schemas.Match(
            id=match.id,
            winner_score=match.winner_score,
            loser_score=match.loser_score,
            winners=[user.id for user in match.winners],
            losers=[user.id for user in match.losers]
        )
        response_matches.append(response_match)
    
    return response_matches


@app.get("/matches/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_match = schemas.Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match

@app.put("/matches/{match_id}", response_model=schemas.Match)
def update_match(match_id: int, match: schemas.MatchCreate, db: Session = Depends(get_db)):
    db_match = crud.update_match(db=db, match_id=match_id, match_data=match)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_match = schemas.Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match


@app.delete("/matches/{match_id}", response_model=schemas.Match)
def delete_match(match_id: int, db: Session = Depends(get_db)):
    db_match = crud.delete_match(db=db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_match = schemas.Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match