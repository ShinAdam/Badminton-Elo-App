from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.crud.user import crud_create_user
from app.database.database import get_db
from app.models.models import User
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.schemas import UserCreate
from app.auth.utils import ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash, create_access_token, authenticate_user, Token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    db: db_dependency,
    create_user_request: UserCreate
):
    db_user = crud_create_user(db, create_user_request)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User could not be created")
    return db_user

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependency
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate user.")
    token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.username, "id": user.id}, expires_delta=token_expires)

    return {"access_token": token, "token_type": "bearer"}
