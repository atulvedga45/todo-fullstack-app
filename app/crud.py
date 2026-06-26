from sqlalchemy.orm import Session
from app.models import Todo, User


# =====================
# TODO FUNCTIONS
# =====================

def create_todo(
    db: Session,
    user_id: int,
    title: str,
    priority: str,
    due_date
):
    todo = Todo(
        user_id=user_id,
        title=title,
        priority=priority,
        due_date=due_date
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo


def get_todos(
    db: Session,
    user_id: int
):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.is_deleted == False
    ).all()


def get_todo(db: Session, todo_id: int, user_id: int):
    return db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id
    ).first()


def update_todo(
    db: Session,
    todo_id: int,
    user_id: int,
    title: str,
    completed: bool,
    priority: str,
    due_date
):
    todo = get_todo(db, todo_id, user_id)

    if todo:
        todo.title = title
        todo.completed = completed
        todo.priority = priority
        todo.due_date = due_date

        db.commit()
        db.refresh(todo)

    return todo


def move_to_trash(db: Session, todo_id: int, user_id: int):
    todo = get_todo(db, todo_id, user_id)

    if todo:
        todo.is_deleted = True

        db.commit()
        db.refresh(todo)

    return todo


def get_trash(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.is_deleted == True
    ).all()


def restore_todo(db: Session, todo_id: int, user_id: int):
    todo = get_todo(db, todo_id, user_id)

    if todo:
        todo.is_deleted = False

        db.commit()
        db.refresh(todo)

    return todo


def permanent_delete(db: Session, todo_id: int, user_id: int):
    todo = get_todo(db, todo_id, user_id)

    if todo:
        db.delete(todo)
        db.commit()

    return todo


def search_todos(db: Session, user_id: int, keyword: str):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.is_deleted == False,
        Todo.title.ilike(f"%{keyword}%")
    ).all()


def get_pending_todos(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.completed == False,
        Todo.is_deleted == False
    ).all()


def get_completed_todos(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.completed == True,
        Todo.is_deleted == False
    ).all()


def get_high_priority_todos(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.priority == "High",
        Todo.is_deleted == False
    ).all()


def get_medium_priority_todos(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.priority == "Medium",
        Todo.is_deleted == False
    ).all()


def get_low_priority_todos(db: Session, user_id: int):
    return db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.priority == "Low",
        Todo.is_deleted == False
    ).all()

# =====================
# USER FUNCTIONS
# =====================


def get_user_by_email(
    db: Session,
    email: str
):
    return db.query(User).filter(
        User.email == email.strip().lower()
    ).first()

def create_user_with_email(
    db: Session,
    email: str
):
    user = User(email=email.strip().lower())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_user_otp(
    db: Session,
    user: User,
    otp: str,
    expiry
):
    user.otp = otp
    user.otp_expiry = expiry
    db.commit()
    db.refresh(user)
    return user

def clear_user_otp(
    db: Session,
    user: User
):
    user.otp = None
    user.otp_expiry = None
    db.commit()
    db.refresh(user)
    return user
