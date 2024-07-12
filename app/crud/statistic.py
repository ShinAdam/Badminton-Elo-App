import logging
from sqlalchemy.orm import Session
from app.models.models import Match, User
from typing import List, Dict

def crud_calculate_elo_change(winner_avg_elo: float, loser_avg_elo: float) -> int:
    # Implement the Chess ELO calculation logic
    k_factor = 32
    expected_score_winner = 1 / (1 + 10 ** ((loser_avg_elo - winner_avg_elo) / 400))
    expected_score_loser = 1 / (1 + 10 ** ((winner_avg_elo - loser_avg_elo) / 400))

    actual_score_winner = 1
    actual_score_loser = 0

    elo_change_winner = k_factor * (actual_score_winner - expected_score_winner)
    elo_change_loser = k_factor * (actual_score_loser - expected_score_loser)

    return int(elo_change_winner), int(elo_change_loser)

def crud_get_full_match_history(db: Session) -> List[Dict]:
    matches = db.query(Match).all()
    history = []

    for match in matches:
        winner_usernames = [user.username for user in match.winners]
        loser_usernames = [user.username for user in match.losers]

        winner_ratings = [user.rating for user in match.winners]
        loser_ratings = [user.rating for user in match.losers]

        winner_avg_rating = sum(winner_ratings) / len(winner_ratings) if winner_ratings else 0
        loser_avg_rating = sum(loser_ratings) / len(loser_ratings) if loser_ratings else 0

        elo_change_winner, elo_change_loser = crud_calculate_elo_change(winner_avg_rating, loser_avg_rating)

        match_details = {
            "match_id": match.id,
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

        history.append(match_details)

    return history

def crud_get_user_match_history(db: Session, user_id: int) -> List[Dict]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    history = []

    for match in user.matches_won + user.matches_lost:
        is_winner = user in match.winners

        match_details = {
            "match_id": match.id,
            "is_winner": is_winner,
            "score": match.winner_score if is_winner else match.loser_score,
            "opponent_usernames": [u.username for u in match.losers] if is_winner else [u.username for u in match.winners],
            "opponent_ratings": [u.rating for u in match.losers] if is_winner else [u.rating for u in match.winners],
            "elo_change": crud_calculate_elo_change(user.rating, sum([u.rating for u in match.losers]) / len(match.losers))[0] if is_winner else crud_calculate_elo_change(sum([u.rating for u in match.winners]) / len(match.winners), user.rating)[1]
        }

        history.append(match_details)

    return history

def crud_get_user_win_percentage(db: Session, user_id: int) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return 0.0

    total_matches = len(user.matches_won) + len(user.matches_lost)
    if total_matches == 0:
        return 0.0

    win_percentage = (len(user.matches_won) / total_matches) * 100
    return win_percentage

def crud_get_user_rankings(db: Session) -> List[Dict]:
    users = db.query(User).order_by(User.rating.desc()).all()
    rankings = []

    for index, user in enumerate(users):
        user_ranking = {
            "rank": index + 1,
            "username": user.username,
            "rating": user.rating
        }
        rankings.append(user_ranking)

    return rankings
