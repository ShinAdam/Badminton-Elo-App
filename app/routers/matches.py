from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.utils import get_current_user
from app.crud.match import crud_create_match, crud_get_match_by_id
from app.schemas.schemas import Match, MatchCreate
from app.database.database import get_db

router = APIRouter(
    prefix="/matches",
    tags=["matches"],
    responses={404: {"description": "Not found"}},
)

# Match endpoints
@router.post("/", response_model=Match)
def create_match(match: MatchCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_match = crud_create_match(db=db, match=match, current_user_id=current_user["id"])
    
    # Convert the User objects in winners and losers to their IDs
    response_match = Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        creator_id=current_user["id"],
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match


@router.get("/{match_id}", response_model=Match)
def get_match_by_match_id(match_id: int, db: Session = Depends(get_db)):
    match = crud_get_match_by_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Convert the winners and losers into comma-separated strings
    if match.winners:
        match.winner_usernames = ','.join([user.username for user in match.winners])
    if match.losers:
        match.loser_usernames = ','.join([user.username for user in match.losers])
    
    return match

#Edit match feature, to be updated later
#@router.put("/{match_id}", response_model=Match)
#def update_match(match_id: int, match: MatchCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_match = crud_update_match(db=db, match_id=match_id, match_data=match, current_user_id=current_user["id"])
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_match = Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        creator_id=current_user["id"],
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match

#delete match feature, to be updated later
#@router.delete("/{match_id}", response_model=Match)
#def delete_match(match_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_match = crud_delete_match(db=db, match_id=match_id, current_user_id=current_user["id"])
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_match = Match(
        id=db_match.id,
        winner_score=db_match.winner_score,
        loser_score=db_match.loser_score,
        creator_id=db_match.creator_id,
        winners=[user.id for user in db_match.winners],
        losers=[user.id for user in db_match.losers]
    )
    return response_match