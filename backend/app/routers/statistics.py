from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.statistic import crud_get_full_match_history
from app.database.database import get_db
from app.schemas.schemas import Match
from app.crud.match import crud_get_recent_matches

router = APIRouter(
    prefix="/statistics",
    tags=["statistics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/full_match_history", response_model=list[Match])
def get_full_match_history(db: Session = Depends(get_db)):
    matches = crud_get_full_match_history(db)
    if not matches:
        raise HTTPException(status_code=404, detail="No matches found")

    # Convert the winners and losers into comma-separated strings
    for match in matches:
        if match.winners:
            match.winner_usernames = ','.join([user.username for user in match.winners])
        if match.losers:
            match.loser_usernames = ','.join([user.username for user in match.losers])
    
    return matches

@router.get("/recent", response_model=list[Match])
def get_recent_matches(db: Session = Depends(get_db), limit: int = 5):
    recent_matches = crud_get_recent_matches(db, limit)
    if not recent_matches:
        raise HTTPException(status_code=404, detail="No recent matches found")
    
    # Convert the winners and losers into comma-separated strings
    for match in recent_matches:
        if match.winners:
            match.winner_usernames = ','.join([user.username for user in match.winners])
        if match.losers:
            match.loser_usernames = ','.join([user.username for user in match.losers])
    
    return recent_matches
