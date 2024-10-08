from sqlalchemy.orm import Session
from app.crud.statistic import calculate_rating_change, crud_update_rating
from app.models.models import Match, User
from app.schemas.schemas import MatchCreate

# Match functions
def crud_get_all_matches(db: Session) -> list[Match]:
    return db.query(Match).all()

def crud_get_match_by_id(db: Session, match_id: int) -> Match:
    return db.query(Match).filter(Match.id == match_id).first()

def crud_get_recent_matches(db: Session, limit: int = 5) -> list[Match]:
    return db.query(Match).order_by(Match.date_played.desc()).limit(limit).all()

def crud_create_match(db: Session, match: MatchCreate, current_user_id: int) -> Match:
    # Ensure exactly 4 unique users are provided
    unique_users = set(match.winners + match.losers)
    if len(unique_users) != 4:
        raise ValueError("Exactly 4 unique users must be provided in a match")

    db_match = Match(
        winner_score=match.winner_score,
        loser_score=match.loser_score,
        creator_id=current_user_id,
        date_played=match.date_played
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    def get_users_and_ratings(user_ids):
        users = db.query(User).filter(User.id.in_(user_ids)).all()
        usernames = [user.username for user in users]
        ratings = [user.rating for user in users]
        return users, usernames, ratings

    winners, winner_usernames, winner_ratings = get_users_and_ratings(match.winners)
    losers, loser_usernames, loser_ratings = get_users_and_ratings(match.losers)

    db_match.winners.extend(winners)
    db_match.losers.extend(losers)
    db.commit()

    # Calculate and update ELO ratings
    winner_avg_rating = sum(winner_ratings) / len(winner_ratings) if winner_ratings else 0
    loser_avg_rating = sum(loser_ratings) / len(loser_ratings) if loser_ratings else 0
    elo_change_winner, elo_change_loser = calculate_rating_change(winner_avg_rating, loser_avg_rating)

    # Update user ratings and match details using crud_update_rating
    crud_update_rating(db, db_match.id, match.winners, match.losers)

    # Update match attributes with calculated values
    db_match.winner_usernames = winner_usernames
    db_match.loser_usernames = loser_usernames
    db_match.winner_avg_rating = winner_avg_rating
    db_match.loser_avg_rating = loser_avg_rating
    db_match.elo_change_winner = elo_change_winner
    db_match.elo_change_loser = elo_change_loser

    db.commit()

    return db_match

#Edit match feature, to be updated later
#def crud_update_match(db: Session, match_id: int, match_data: MatchUpdate, current_user_id: int) -> Match:
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if db_match:
        # Check if the current user is the creator of the match
        if db_match.creator_id != current_user_id:
            raise ValueError("Only the creator can update the match")

        db_match.winner_score = match_data.winner_score
        db_match.loser_score = match_data.loser_score

        # Clear existing winners and losers
        db_match.winners.clear()
        db_match.losers.clear()

        # Add updated winners and losers
        winners = []
        for user_id in match_data.winners:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                db_match.winners.append(user)
                winners.append(user)

        losers = []
        for user_id in match_data.losers:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                db_match.losers.append(user)
                losers.append(user)

        db.commit()
        db.refresh(db_match)

        # Calculate and update ELO ratings
        crud_update_rating(db, match_id, winners, losers)

    return db_match

#Delete match feature, to be updated later
#def crud_delete_match(db: Session, match_id: int, current_user_id: int) -> Match:
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if db_match:
        # Check if the current user is the creator of the match
        if db_match.creator_id != current_user_id:
            raise ValueError("You do not have permission to delete this match")

        db.delete(db_match)
        db.commit()
    return db_match