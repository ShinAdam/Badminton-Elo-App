from psycopg2 import IntegrityError
from sqlalchemy.orm import Session

import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(username=user.username, hashed_password=fake_hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        return None


def get_match(db: Session, match_id: int):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if match:
        user_ids = [um.user_id for um in match.user_matches]
        return schemas.Match(id=match.id, winner_score=match.winner_score, loser_score=match.loser_score, users=user_ids)
    return None


def get_matches(db: Session, skip: int = 0, limit: int = 100):
    matches = db.query(models.Match).offset(skip).limit(limit).all()
    result = []
    for match in matches:
        user_ids = [um.user_id for um in match.user_matches]
        result.append(schemas.Match(id=match.id, winner_score=match.winner_score, loser_score=match.loser_score, users=user_ids))
    return result



def create_match(db: Session, match: schemas.MatchCreate):
    try:
        db.begin_nested()  # Start a nested transaction

        # Create the match object
        db_match = models.Match(winner_score=match.winner_score, loser_score=match.loser_score)
        db.add(db_match)
        db.flush()  # Ensure the match ID is available
        db.refresh(db_match)  # Refresh to get the generated ID

        # Create user_match entries
        user_matches = [
            models.UserMatch(user_id=user_id, match_id=db_match.id)
            for user_id in match.user_ids
        ]
        db.bulk_save_objects(user_matches)
        db.commit()  # Commit the transaction

        # Get user IDs
        user_ids = [um.user_id for um in user_matches]

    except Exception as e:
        db.rollback()  # Rollback the transaction if any exception occurs
        raise e

    return schemas.Match(id=db_match.id, winner_score=match.winner_score, loser_score=match.loser_score, users=user_ids)


def add_user_to_match(db: Session, user_match: schemas.UserMatchCreate):
    db_user_match = models.UserMatch(user_id=user_match.user_id, match_id=user_match.match_id)
    db.add(db_user_match)
    db.commit()
    db.refresh(db_user_match)
    return db_user_match


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