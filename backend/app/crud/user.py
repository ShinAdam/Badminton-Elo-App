import base64
from fastapi import HTTPException
from psycopg2 import IntegrityError
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.auth.utils import get_password_hash, save_picture
from app.models.models import User, Match
from app.schemas.schemas import UserCreate, UserUpdate

# User functions
def crud_get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def crud_get_user_by_id(db: Session, user_id: int) -> User:
    return db.query(User).filter(User.id == user_id).first()

def crud_get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def crud_get_users_by_rating(db: Session):
    return db.query(User).order_by(User.rating.desc()).all()

def crud_create_user(db: Session, user_data: UserCreate):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        hashed_password=hashed_password,
        rating=1000,  # default rating
        bio=user_data.bio,
        picture=user_data.picture
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def crud_update_user(db: Session, user_id: int, user_data: UserUpdate, current_user_id: int) -> User:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    db_user.username = user_data.username
    if user_data.password:
        db_user.hashed_password = get_password_hash(user_data.password)
    db_user.bio = user_data.bio

    if user_data.picture:
        db_user.picture = user_data.picture

    db.commit()
    db.refresh(db_user)

    return db_user

def crud_delete_user(db: Session, user_id: int, current_user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        if current_user_id == user_id:
            db.delete(db_user)
            db.commit()
            return db_user
        else:
            raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    else:
        return None

def crud_get_user_matches(db: Session, user_id: int) -> list[Match]:
    return db.query(Match).filter(or_(Match.winners.any(id=user_id), Match.losers.any(id=user_id))).all()