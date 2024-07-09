from pydantic import BaseModel


#UserMatch
class UserMatchBase(BaseModel):
    user_id: int
    match_id: int


class UserMatchCreate(UserMatchBase):
    pass


class UserMatch(UserMatchBase):
    id: int

    class Config:
        orm_mode = True



#Match
class MatchBase(BaseModel):
    winner_score: int
    loser_score: int


class MatchCreate(MatchBase):
    user_ids: list[int]


class Match(MatchBase):
    id: int
    users: list[int] = []
    

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
    matches: list[int] = []

    class Config:
        orm_mode: True