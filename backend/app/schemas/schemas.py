from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

# Match
class MatchBase(BaseModel):
    winner_score: int
    loser_score: int

class MatchCreate(MatchBase):
    winners: list[int] = []
    losers: list[int] = []
    date_played: date

class MatchUpdate(MatchBase):
    pass

class Match(MatchBase):
    id: int
    creator_id: int
    winner_usernames: Optional[str] = None
    loser_usernames: Optional[str] = None
    winner_avg_rating: Optional[float] = None
    loser_avg_rating: Optional[float] = None
    elo_change_winner: Optional[float] = None
    elo_change_loser: Optional[float] = None
    date_played: Optional[date] = None

    class Config:
        from_attributes = True

# User
class UserBase(BaseModel):
    username: str = Field(...)
    bio: Optional[str] = None
    picture: Optional[str] = None

class UserCreate(UserBase):
    password: str
    bio: Optional[str] = None
    picture: Optional[str] = None

class UserUpdate(UserBase):
    username: str = Field(None, title="Updated Username")
    password: str = Field(None, title="Updated Password")
    bio: Optional[str] = None
    picture: Optional[str] = None

    class Config:
        from_attributes = True

class UserRanking(BaseModel):
    id: int
    username: str
    rating: float


class User(UserBase):
    id: int
    rating: float
    matches_won: list[int] = []
    matches_lost: list[int] = []
    win_percentage: float

    class Config:
        from_attributes = True

# Winner / Loser
class WinnerBase(BaseModel):
    user_id: int
    match_id: int

class WinnerCreate(WinnerBase):
    pass

class Winner(WinnerBase):
    class Config:
        from_attributes = True

class LoserBase(BaseModel):
    user_id: int
    match_id: int

class LoserCreate(LoserBase):
    pass

class Loser(LoserBase):
    class Config:
        from_attributes = True
