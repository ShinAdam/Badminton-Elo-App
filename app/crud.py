from psycopg2 import IntegrityError
from sqlalchemy.orm import Session

import models, schemas


#User functions
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password
    db_user = models.User(username=user.username, hashed_password=fake_hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        return None


def update_user(db: Session, user_id: int, user_data: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.username = user_data.username
        fake_hashed_password = user_data.password
        db_user.hashed_password = fake_hashed_password
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return db_user
    else:
        return None


#Match functions
def get_match(db: Session, match_id: int):
    return db.query(models.Match).filter(models.Match.id == match_id).first()


def get_matches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Match).offset(skip).limit(limit).all()


def create_match(db: Session, match: schemas.MatchCreate):
    # Ensure exactly 4 unique users are provided
    unique_users = set(match.winners + match.losers)
    if len(unique_users) != 4:
        raise ValueError("Exactly 4 unique users must be provided in a match")

    db_match = models.Match(winner_score=match.winner_score, loser_score=match.loser_score)
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    for user_id in match.winners:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        db_match.winners.append(user)

    for user_id in match.losers:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        db_match.losers.append(user)

    db.commit()
    db.refresh(db_match)
    return db_match


def update_match(db: Session, match_id: int, match_data: schemas.MatchCreate):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if db_match:
        db_match.winner_score = match_data.winner_score
        db_match.loser_score = match_data.loser_score

        # Clear existing winners and losers
        db_match.winners.clear()
        db_match.losers.clear()

        # Add updated winners and losers
        for user_id in match_data.winners:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            db_match.winners.append(user)

        for user_id in match_data.losers:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            db_match.losers.append(user)

        db.commit()
        db.refresh(db_match)
    return db_match


def delete_match(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if db_match:
        db.delete(db_match)
        db.commit()
    return db_match


#def get_user_matches(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Match)
        .filter(
            (models.Match.winner1_id == user_id) |
            (models.Match.winner2_id == user_id) |
            (models.Match.loser1_id == user_id) |
            (models.Match.loser2_id == user_id)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )