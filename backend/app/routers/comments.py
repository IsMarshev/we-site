from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas


router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.get("/place/{place_id}", response_model=List[schemas.CommentOut])
def list_comments_for_place(place_id: int, db: Session = Depends(get_db)):
    place_exists = db.query(models.Place.id).filter(models.Place.id == place_id).first()
    if not place_exists:
        raise HTTPException(status_code=404, detail="Place not found")
    return (
        db.query(models.Comment)
        .filter(models.Comment.place_id == place_id)
        .order_by(models.Comment.id.desc())
        .all()
    )


@router.post("/place/{place_id}", response_model=schemas.CommentOut, status_code=201)
def create_comment(place_id: int, payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    place_exists = db.query(models.Place.id).filter(models.Place.id == place_id).first()
    if not place_exists:
        raise HTTPException(status_code=404, detail="Place not found")
    obj = models.Comment(place_id=place_id, author=payload.author, content=payload.content)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

