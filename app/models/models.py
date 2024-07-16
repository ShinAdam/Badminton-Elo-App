from datetime import date
from sqlalchemy import Column, Date, Integer, String, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

match_user_association = Table(
    'match_user', Base.metadata,
    Column('match_id', ForeignKey('matches.id'), primary_key=True),
    Column('user_id', ForeignKey('users.id'), primary_key=True)
)

winners_table = Table(
    'winners',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('match_id', Integer, ForeignKey('matches.id', ondelete='CASCADE'))
)

losers_table = Table(
    'losers',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('match_id', Integer, ForeignKey('matches.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    rating = Column(Float, default=1000, index=True)
    bio = Column(String, nullable=True)
    picture = Column(String, nullable=True)

    matches_won = relationship("Match", secondary=winners_table, back_populates="winners")
    matches_lost = relationship("Match", secondary=losers_table, back_populates="losers")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    winner_score = Column(Integer, default=21)
    loser_score = Column(Integer)
    creator_id = Column(Integer, nullable=False)
    date_played = Column(Date, default=date.today())

    winner_usernames = Column(String, nullable=True)
    loser_usernames = Column(String, nullable=True)
    winner_avg_rating = Column(Float, nullable=True)
    loser_avg_rating = Column(Float, nullable=True)
    elo_change_winner = Column(Integer, nullable=True)
    elo_change_loser = Column(Integer, nullable=True)

    winners = relationship("User", secondary=winners_table, back_populates="matches_won")
    losers = relationship("User", secondary=losers_table, back_populates="matches_lost")