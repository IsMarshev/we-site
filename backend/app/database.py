from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os


DB_PATH = os.environ.get("CT_DB_PATH", os.path.join(os.path.dirname(__file__), "ct_travel.db"))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

