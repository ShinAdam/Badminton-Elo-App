from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.crud.statistic import crud_get_full_match_history
from app.database.database import get_db

router = APIRouter(
    prefix="/statistics",
    tags=["statistics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/full_match_history", response_model=List[Dict])
def full_match_history(db: Session = Depends(get_db)):
    history = crud_get_full_match_history(db=db)
    if history is None:
        raise HTTPException(status_code=404, detail="No match history found")
    return history
