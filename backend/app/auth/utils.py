from datetime import timedelta, datetime, timezone
import imghdr
import os
from typing import Annotated
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from starlette import status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.models.models import User

SECRET_KEY = 'secret123'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 20

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user or not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

blacklist: set[str] = set()

def revoke_token(token: str):
    blacklist.add(token)

def is_token_blacklisted(token: str) -> bool:
    return token in blacklist

def verify_token(token: str) -> dict:
    if is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        # Log or print the token
    print("Generated Token:", encoded_jwt)  # This will print to the console/log
    
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_bearer)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)  # Use verify_token to decode and validate the token
    username: str = payload.get("sub")
    user_id: int = payload.get("id")
    
    if username is None or user_id is None:
        raise credentials_exception
    return {"username": username, "id": user_id}


def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)


def save_picture(file_data: bytes, user_id: int) -> str:
    file_extension = imghdr.what(None, file_data)
    if not file_extension:
        raise ValueError("Invalid image format")
    file_location = f"profile_pics/profile_picture_user{user_id}.{file_extension}"
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_directory = os.path.normpath(os.path.join(current_dir, '..', 'static'))
    os.makedirs(os.path.join(static_directory, "profile_pics"), exist_ok=True)
    
    with open(os.path.join(static_directory, file_location), "wb") as f:
        f.write(file_data)
    
    return file_location
