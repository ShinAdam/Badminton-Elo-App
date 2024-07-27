from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.auth.utils import get_current_user
from app.crud.statistic import crud_get_user_win_percentage
from app.crud.user import (
    crud_get_user, crud_get_user_matches, crud_get_users_by_rating, 
    crud_update_user, crud_delete_user
)
from app.schemas.schemas import Match, User, UserRanking, UserUpdate
from app.database.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

def get_user_response(db_user, win_percentage):
    return {
        "id": db_user.id,
        "username": db_user.username,
        "rating": db_user.rating,
        "matches_won": [match.id for match in db_user.matches_won],
        "matches_lost": [match.id for match in db_user.matches_lost],
        "win_percentage": win_percentage,
        "bio": db_user.bio or None,
        "picture": db_user.picture or None
    }

@router.get("/ranking", response_model=list[UserRanking])
def get_users_by_rating(db: Session = Depends(get_db)):
    users = crud_get_users_by_rating(db)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users

@router.get("/{user_id}", response_model=User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    win_percentage = crud_get_user_win_percentage(db, user_id=user_id)
    return get_user_response(db_user, win_percentage)

@router.put("/{user_id}/edit", response_model=User)
async def update_user(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this user.")
    
    data = await request.json()
    user_data = UserUpdate(
        username=data.get('username'),
        bio=data.get('bio'),
        picture=data.get('picture'),
        password=data.get('password') if data.get('password') else None
    )

    db_user = crud_update_user(db=db, user_id=user_id, user_data=user_data, current_user_id=current_user["id"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_matches = len(db_user.matches_won) + len(db_user.matches_lost)
    win_percentage = (len(db_user.matches_won) / total_matches) * 100 if total_matches > 0 else 0
    return get_user_response(db_user, win_percentage)

@router.delete("/{user_id}/delete", response_model=User)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_user = crud_delete_user(db=db, user_id=user_id, current_user_id=current_user["id"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return get_user_response(db_user, 0)

@router.get("/{user_id}/matches", response_model=list[Match])
def read_user_matches(user_id: int, db: Session = Depends(get_db)):
    user_matches = crud_get_user_matches(db=db, user_id=user_id)
    if not user_matches:
        raise HTTPException(status_code=404, detail="Matches not found for this user")
    
    return [
        {
            "id": match.id,
            "creator_id": match.creator_id,
            "winner_usernames": match.winner_usernames.strip('{}').replace(',', ', ') if match.winner_usernames else 'N/A',
            "loser_usernames": match.loser_usernames.strip('{}').replace(',', ', ') if match.loser_usernames else 'N/A',
            "winner_avg_rating": match.winner_avg_rating,
            "loser_avg_rating": match.loser_avg_rating,
            "elo_change_winner": match.elo_change_winner,
            "elo_change_loser": match.elo_change_loser,
            "winner_score": match.winner_score,
            "loser_score": match.loser_score,
            "date_played": match.date_played.isoformat()
        }
        for match in user_matches
    ]