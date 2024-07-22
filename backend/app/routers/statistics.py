from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.statistic import crud_get_full_match_history
from app.database.database import get_db
from app.schemas.schemas import Match

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
