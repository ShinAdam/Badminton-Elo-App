import logging
import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.auth.utils import get_current_user
from app.crud.statistic import crud_get_user_win_percentage
from app.crud.user import crud_get_user, crud_get_user_matches, crud_get_users_by_rating, crud_update_user, crud_delete_user
from app.schemas.schemas import Match, User, UserRanking, UserUpdate
from app.models.models import User as UserModel
from app.database.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


@router.get("/ranking", response_model=list[UserRanking])
def get_users_by_rating(db: Session = Depends(get_db)):
    users = crud_get_users_by_rating(db)
    if users is None:
        raise HTTPException(status_code=404, detail="No users found")
    
    return users


@router.get("/{user_id}", response_model=User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    win_percentage = crud_get_user_win_percentage(db, user_id=user_id)

    response_user = {
        "id": db_user.id,
        "username": db_user.username,
        "rating": db_user.rating,
        "matches_won": [match.id for match in db_user.matches_won],
        "matches_lost": [match.id for match in db_user.matches_lost],
        "win_percentage": win_percentage,
        "bio": db_user.bio or None,
        "picture": db_user.picture or None
    }
    return response_user


@router.put("/{user_id}/edit", response_model=User)
async def update_user(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this user."
        )

    data = await request.json()
    username = data.get('username')
    password = data.get('password')
    bio = data.get('bio')
    picture_name = data.get('picture')  # Get preset picture name

    user_data = UserUpdate(username=username, bio=bio, picture=picture_name)

    if password:
        user_data.password = password

    db_user = crud_update_user(
        db=db,
        user_id=user_id,
        user_data=user_data,
        current_user_id=current_user["id"]
    )
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    total_matches = len(db_user.matches_won) + len(db_user.matches_lost)
    win_percentage = (len(db_user.matches_won) / total_matches) * 100 if total_matches > 0 else 0

    response_user = User(
        id=db_user.id,
        username=db_user.username,
        rating=db_user.rating,
        matches_won=[match.id for match in db_user.matches_won],
        matches_lost=[match.id for match in db_user.matches_lost],
        win_percentage=win_percentage
    )
    return response_user


@router.delete("/{user_id}/delete", response_model=User)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_user = crud_delete_user(db=db, user_id=user_id, current_user_id=current_user["id"])
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the User objects in winners and losers to their IDs
    response_user = User(
        id=db_user.id,
        username=db_user.username,
        rating=db_user.rating,
        matches_won=[match.id for match in db_user.matches_won],
        matches_lost=[match.id for match in db_user.matches_lost]
    )
    return response_user


@router.get("/{user_id}/matches", response_model=list[Match])
def read_user_matches(user_id: int, db: Session = Depends(get_db)):
    user_matches = crud_get_user_matches(db=db, user_id=user_id)
    if user_matches is None:
        raise HTTPException(status_code=404, detail="Matches not found for this user")
    
    matches_response = []
    for match in user_matches:
        matches_response.append({
            "id": match.id,
            "creator_id": match.creator_id,
            "winner_usernames": match.winner_usernames.strip('{}').replace(',', ', '),
            "loser_usernames": match.loser_usernames.strip('{}').replace(',', ', '),
            "winner_avg_rating": match.winner_avg_rating,
            "loser_avg_rating": match.loser_avg_rating,
            "elo_change_winner": match.elo_change_winner,
            "elo_change_loser": match.elo_change_loser,
            "winner_score": match.winner_score,
            "loser_score": match.loser_score,
            "date_played": match.date_played.isoformat()
        })
    
    return matches_response
