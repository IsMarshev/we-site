from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.post("/", response_model=schemas.ContactOut, status_code=201)
def create_contact(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    obj = models.ContactMessage(name=payload.name, email=str(payload.email), message=payload.message)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=List[schemas.ContactOut])
def list_contacts(db: Session = Depends(get_db)):
    # Simple list endpoint to verify data in admin/dev; in prod you might secure it.
    return db.query(models.ContactMessage).order_by(models.ContactMessage.id.desc()).all()

