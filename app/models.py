from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class UserMatch(Base):
    __tablename__ = "user_match"

    id = Column(Integer, primary_key=True)
    user_id = Column("user_id", Integer, ForeignKey("users.id"))
    match_id = Column("match_id", Integer, ForeignKey("matches.id"))

    match = relationship("Match", back_populates="user_matches")
    user = relationship("User", back_populates="user_matches")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    rating = Column(Float, default=1000, index=True)
    matches = relationship("Match", secondary="user_match")

    user_matches = relationship("UserMatch", back_populates="user")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    winner_score = Column(Integer, default=21)
    loser_score = Column(Integer)
    users = relationship("User", secondary="user_match")

    user_matches = relationship("UserMatch", back_populates="match")
