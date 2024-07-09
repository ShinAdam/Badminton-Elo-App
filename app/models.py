from sqlalchemy import Column, Enum, Float, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


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

    matches_won = relationship("Match", secondary=winners_table, back_populates="winners")
    matches_lost = relationship("Match", secondary=losers_table, back_populates="losers")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    winner_score = Column(Integer, default=21)
    loser_score = Column(Integer)

    winners = relationship("User", secondary=winners_table, back_populates="matches_won")
    losers = relationship("User", secondary=losers_table, back_populates="matches_lost")
