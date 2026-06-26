from pydantic import BaseModel
from datetime import datetime


# =========================
# TODO SCHEMAS
# =========================
class TodoCreate(BaseModel):
    title: str
    priority: str = "Medium"
    due_date: datetime | None = None


class TodoUpdate(BaseModel):
    title: str
    completed: bool
    priority: str
    due_date: datetime | None = None


class TodoResponse(BaseModel):
    id: int
    title: str
    completed: bool
    priority: str
    due_date: datetime | None = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =========================
# AUTH SCHEMAS
# =========================

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    username: str | None = None
    profile_picture: str | None = None

    class Config:
        from_attributes = True
