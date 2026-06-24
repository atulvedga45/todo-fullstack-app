from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate
from app.crud import (
    create_user,
    get_users,
    get_user,
    update_user,
    delete_user
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/")
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user.name, user.email)


@router.get("/")
def read_users(db: Session = Depends(get_db)):
    return get_users(db)


@router.get("/{user_id}")
def read_single_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.put("/{user_id}")
def update_single_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db)
):
    updated_user = update_user(
        db,
        user_id,
        user.name,
        user.email
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


@router.delete("/{user_id}")
def delete_single_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    deleted_user = delete_user(db, user_id)

    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}