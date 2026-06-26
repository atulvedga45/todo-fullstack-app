from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.crud import (
    get_user_by_email,
    create_user_with_email,
    set_user_otp,
    clear_user_otp
)
from app.auth import create_access_token
from app.schemas import OTPRequest, OTPVerify, UserProfileResponse
from app.email_service import send_otp_email
from app.dependencies import get_current_user
from app.models import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

def generate_otp():
    return str(random.randint(100000, 999999))

@router.post("/request-otp")
def request_otp(
    req: OTPRequest,
    db: Session = Depends(get_db)
):
    email_normalized = req.email.strip().lower()
    user = get_user_by_email(db, email_normalized)
    if not user:
        # Create user if they don't exist (acting as both register and login)
        user = create_user_with_email(db, email_normalized)
    
    otp = generate_otp()
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    set_user_otp(db, user, otp, expiry)
    
    # Send email
    send_otp_email(email_normalized, otp)
    
    return {"message": "OTP sent to your email."}

@router.post("/verify-otp")
def verify_otp(
    req: OTPVerify,
    db: Session = Depends(get_db)
):
    email_normalized = req.email.strip().lower()
    user = get_user_by_email(db, email_normalized)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.otp or user.otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Using naive datetime check, but assuming timezone aware if db returns it
    # We should ensure timezone comparison is correct. For simplicity, just checking if expired.
    if user.otp_expiry:
        # DB might return naive datetime, let's make it UTC aware if it isn't
        expiry = user.otp_expiry
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
            
        if datetime.now(timezone.utc) > expiry:
            raise HTTPException(status_code=400, detail="OTP has expired")
            
    # OTP is valid, clear it
    clear_user_otp(db, user)
    
    # Generate token
    token = create_access_token({"sub": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    profile_picture: Optional[str] = None

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    req_body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req_body.username is not None:
        current_user.username = req_body.username.strip()
    if req_body.profile_picture is not None:
        current_user.profile_picture = req_body.profile_picture
    
    db.commit()
    db.refresh(current_user)
    return current_user
