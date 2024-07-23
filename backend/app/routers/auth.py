import base64
from datetime import timedelta
import logging
import os
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from starlette import status
from app.crud.user import crud_create_user
from app.database.database import SessionLocal, get_db
from app.models.models import User
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.schemas import UserCreate
from app.auth.utils import ACCESS_TOKEN_EXPIRE_MINUTES, LoginRequest, get_password_hash, create_access_token, authenticate_user, Token, get_current_user, revoke_token, save_picture, oauth2_bearer

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/login", response_model=Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        data = await request.json()
        login_request = LoginRequest(**data)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON format")
    
    user = authenticate_user(login_request.username, login_request.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user.username, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()
    username = data.get('username')
    password = data.get('password')
    bio = data.get('bio')
    picture_data = data.get('picture')

    # Create user first
    user_data = UserCreate(username=username, password=password, bio=bio)
    try:
        db_user = crud_create_user(db, user_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User creation failed: {e}")

    # Handle file upload and save it with the new filename
    if picture_data:
        try:
            header, encoded = picture_data.split(',', 1)
            file_data = base64.b64decode(encoded)
            picture_location = save_picture(file_data, db_user.id)
            db_user.picture = picture_location
            # Update user profile with picture path
            db.commit()  # Assuming you need to commit the changes
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image processing failed: {e}")

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


@router.get("/self", response_model=dict[str, str])
async def get_self(user: dict = Depends(get_current_user)):
    try:
        return {"username": user["username"], "id": str(user["id"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/logout")
def logout(token: str = Depends(oauth2_bearer), db: Session = Depends(get_db)):
    try:
        revoke_token(token)
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))