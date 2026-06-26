from app.database import Base, engine
from app.models import User, Todo

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Recreate all tables with the new schema
Base.metadata.create_all(bind=engine)

print("Database tables dropped and recreated successfully with the new schema!")
