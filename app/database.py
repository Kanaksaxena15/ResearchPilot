import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///research_pilot.db"

# Create engine and session maker
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(String, server_default="CURRENT_TIMESTAMP")

    papers = relationship("Paper", back_populates="owner", cascade="all, delete-orphan")

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    title = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    insights = Column(Text, nullable=True)
    created_at = Column(String, server_default="CURRENT_TIMESTAMP")

    owner = relationship("User", back_populates="papers")

def init_db():
    # Automatically create the SQlite tables if they do not exist
    Base.metadata.create_all(bind=engine)

# Dependency to provide clean session lifecycle
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
