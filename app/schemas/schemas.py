from typing import Optional
from pydantic import BaseModel, Field


#Match
class MatchBase(BaseModel):
    winner_score: int
    loser_score: int

class MatchCreate(MatchBase):
    winners: list[int] = []
    losers: list[int] = []

class MatchUpdate(MatchBase):
    pass

class Match(MatchBase):
    id: int
    creator_id: int
    winner_usernames: Optional[list[str]] = None
    loser_usernames: Optional[list[str]] = None
    winner_avg_rating: Optional[float] = None
    loser_avg_rating: Optional[float] = None
    elo_change_winner: Optional[int] = None
    elo_change_loser: Optional[int] = None
    
    class Config:
        orm_mode: True

#User
class UserBase(BaseModel):
    username: str = Field(...)

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    username: str = Field(None, title="Updated Username")
    password: str = Field(None, title="Updated Password")

class User(UserBase):
    id: int
    rating: float
    matches_won: list[int] = []
    matches_lost: list[int] = []

    class Config:
        orm_mode: True


#Winner / Loser
class WinnerBase(BaseModel):
    user_id: int
    match_id: int

class WinnerCreate(WinnerBase):
    pass

class Winner(WinnerBase):

    class Config:
        orm_mode = True


class LoserBase(BaseModel):
    user_id: int
    match_id: int

class LoserCreate(LoserBase):
    pass

class Loser(LoserBase):

    class Config:
        orm_mode = True