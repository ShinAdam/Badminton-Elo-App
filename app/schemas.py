from pydantic import BaseModel


#Match
class MatchBase(BaseModel):
    winner_score: int
    loser_score: int

class MatchCreate(MatchBase):
    winners: list[int] = []
    losers: list[int] = []

class Match(MatchBase):
    id: int
    winners: list[int] = []
    losers: list[int] = []
    
    class Config:
        orm_mode: True

#User
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    rating: float
    matches_won: list[int] = []
    matches_lost: list[int] = []

    class Config:
        orm_mode: True


#UserMatch
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