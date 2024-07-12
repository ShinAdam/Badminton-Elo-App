from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.utils import get_current_user
from app.crud.user import crud_get_user, crud_get_user_by_username, crud_get_users, crud_create_user, crud_update_user, crud_delete_user
from app.schemas.schemas import User, UserCreate, UserUpdate
from app.database.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    return {"User": user}


# User endpoints
#@router.post("/users/", response_model=User)
#def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)


@router.get("/", response_model=list[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_users = crud_get_users(db, skip=skip, limit=limit)
    if db_users is None:
        raise HTTPException(status_code=404, detail="Match not found")    
    
    # Convert the User objects in winners and losers to their IDs for each match
    response_users = []
    for user in db_users:
        response_user = User(
            id=user.id,
            username=user.username,
            rating=user.rating,
            matches_won=[match.id for match in user.matches_won],
            matches_lost=[match.id for match in user.matches_lost]
        )
        response_users.append(response_user)
    
    return response_users


@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_get_user(db, user_id=user_id)
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


@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_user = crud_update_user(db=db, user_id=user_id, user_data=user, current_user_id=current_user["id"])
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


@router.delete("/{user_id}", response_model=User)
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


#@router.get("/users/{user_id}/matches", response_model=List[schemas.Match])
#def read_user_matches(user_id: int, db: Session = Depends(get_db)):
    user_matches = get_user_matches(db=db, user_id=user_id)
    if user_matches is None:
        raise HTTPException(status_code=404, detail="Matches not found for this user")
    return user_matches

