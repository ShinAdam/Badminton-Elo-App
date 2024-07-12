from fastapi import HTTPException
from psycopg2 import IntegrityError
from sqlalchemy.orm import Session
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate


#User functions
def crud_get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def crud_get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def crud_get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def crud_create_user(db: Session, user: UserCreate):
    hashed_password = user.password
    db_user = User(username=user.username, hashed_password=hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        return None


def crud_update_user(db: Session, user_id: int, user_data: UserUpdate, current_user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        if current_user_id == user_id:  # Ensure only the user themselves can update their data
            for field, value in vars(user_data).items():
                setattr(db_user, field, value) if value else None
            db.commit()
            db.refresh(db_user)
            return db_user
        else:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
    else:
        raise HTTPException(status_code=404, detail="User not found")


def crud_delete_user(db: Session, user_id: int, current_user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        if current_user_id == user_id:  # Ensure only the user themselves can update their data
            db.delete(db_user)
            db.commit()
            return db_user
        else:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
    else:
        return None


def crud_snapshot_user(user: User, is_winner: bool):
    return {
        "id": user.id,
        "username": user.username,
        "rating": user.rating,
        "is_winner": is_winner
    }
