from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Todo(Base):
    __tablename__ = "todos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=False
)

    title = Column(
        String,
        nullable=False
    )

    completed = Column(
        Boolean,
        default=False
    )

    priority = Column(
        String,
        default="Medium"
    )

    due_date = Column(
        DateTime,
        nullable=True
    )

    is_deleted = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    hashed_password = Column(
        String,
        nullable=False
    )
