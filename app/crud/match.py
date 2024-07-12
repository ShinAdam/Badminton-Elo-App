from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.crud.statistic import crud_calculate_elo_change
from app.models.models import Match, User
from app.schemas.schemas import MatchCreate, MatchUpdate

# Match functions
def crud_get_match(db: Session, match_id: int) -> Optional[Dict]:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return None

    winner_usernames = [user.username for user in match.winners]
    loser_usernames = [user.username for user in match.losers]

    winner_ratings = [user.rating for user in match.winners]
    loser_ratings = [user.rating for user in match.losers]

    winner_avg_rating = sum(winner_ratings) / len(winner_ratings) if winner_ratings else 0
    loser_avg_rating = sum(loser_ratings) / len(loser_ratings) if loser_ratings else 0

    elo_change_winner, elo_change_loser = crud_calculate_elo_change(winner_avg_rating, loser_avg_rating)

    match_details = {
        "id": match.id,
        "creator_id": match.creator_id,
        "winner_usernames": winner_usernames,
        "loser_usernames": loser_usernames,
        "winner_score": match.winner_score,
        "loser_score": match.loser_score,
        "winner_avg_rating": winner_avg_rating,
        "loser_avg_rating": loser_avg_rating,
        "elo_change_winner": elo_change_winner,
        "elo_change_loser": elo_change_loser
    }

    return match_details


def crud_get_matches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Match).offset(skip).limit(limit).all()

def crud_create_match(db: Session, match: MatchCreate, current_user_id: int) -> Match:
    # Ensure exactly 4 unique users are provided
    unique_users = set(match.winners + match.losers)
    if len(unique_users) != 4:
        raise ValueError("Exactly 4 unique users must be provided in a match")

    db_match = Match(
        winner_score=match.winner_score,
        loser_score=match.loser_score,
        creator_id=current_user_id
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    # Associate winners and losers with the match
    for user_id in match.winners:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db_match.winners.append(user)

    for user_id in match.losers:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db_match.losers.append(user)

    db.commit()
    db.refresh(db_match)
    return db_match

def crud_update_match(db: Session, match_id: int, match_data: MatchUpdate, current_user_id: int) -> Match:
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if db_match:
        db_match.winner_score = match_data.winner_score
        db_match.loser_score = match_data.loser_score

        # Clear existing winners and losers
        db_match.winners.clear()
        db_match.losers.clear()

        # Add updated winners and losers
        for user_id in match_data.winners:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                db_match.winners.append(user)

        for user_id in match_data.losers:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                db_match.losers.append(user)

        db.commit()
        db.refresh(db_match)
    return db_match

def crud_delete_match(db: Session, match_id: int, current_user_id: int) -> Match:
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if db_match:
        # Check if the current user is the creator of the match
        if db_match.creator_id != current_user_id:
            raise ValueError("You do not have permission to delete this match")

        db.delete(db_match)
        db.commit()
    return db_match