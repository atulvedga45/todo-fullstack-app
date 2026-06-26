
from app.dependencies import get_current_user
from app.models import User
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import TodoCreate, TodoUpdate


from app.crud import (
    create_todo,
    get_todos,
    update_todo,
    move_to_trash,
    get_trash,
    restore_todo,
    permanent_delete,
    search_todos,
    get_pending_todos,
    get_completed_todos,
    get_high_priority_todos,
    get_medium_priority_todos,
    get_low_priority_todos
)
router = APIRouter(
    prefix="/todos",
    tags=["Todos"]
)


@router.post("/")
def add_todo(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_todo(
        db,
        current_user.id,
        todo.title,
        todo.priority,
        todo.due_date
    )


@router.get("/")
def read_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_todos(
        db,
        current_user.id
    )


@router.get("/pending")
def pending_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_pending_todos(db, current_user.id)


@router.get("/completed")
def completed_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_completed_todos(db, current_user.id)


@router.get("/high")
def high_priority_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_high_priority_todos(db, current_user.id)


@router.get("/medium")
def medium_priority_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_medium_priority_todos(db, current_user.id)


@router.get("/low")
def low_priority_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_low_priority_todos(db, current_user.id)


@router.get("/search")
def search(
    q: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return search_todos(db, current_user.id, q)


@router.put("/{todo_id}")
def edit_todo(
    todo_id: int,
    todo: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = update_todo(
        db,
        todo_id,
        current_user.id,
        todo.title,
        todo.completed,
        todo.priority,
        todo.due_date
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    return updated


@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = move_to_trash(
        db,
        todo_id,
        current_user.id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    return {
        "message": "Moved to trash"
    }


@router.get("/trash")
def view_trash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_trash(db, current_user.id)


@router.patch("/restore/{todo_id}")
def restore(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todo = restore_todo(
        db,
        todo_id,
        current_user.id
    )

    if not todo:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    return todo


@router.delete("/permanent/{todo_id}")
def delete_forever(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todo = permanent_delete(
        db,
        todo_id,
        current_user.id
    )

    if not todo:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    return {
        "message": "Deleted permanently"
    }
