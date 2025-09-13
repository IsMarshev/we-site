import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, get_optional_user, require_admin
from sqlalchemy import func


router = APIRouter(prefix="/api/gallery", tags=["gallery"])


@router.get("/", response_model=List[schemas.GalleryOut])
def list_gallery(db: Session = Depends(get_db)):
    return db.query(models.GalleryImage).order_by(models.GalleryImage.id.desc()).all()


@router.post("/url", response_model=schemas.GalleryOut, status_code=201)
def add_gallery_by_url(payload: schemas.GalleryCreateUrl, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")
    obj = models.GalleryImage(title=payload.title, image_url=payload.image_url, created_by=admin.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


UPLOAD_DIR = os.environ.get("CT_UPLOAD_DIR") or os.path.join(os.path.dirname(__file__), "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=schemas.GalleryOut, status_code=201)
def upload_gallery_image(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    # Save file
    filename = file.filename or "upload.jpg"
    safe_name = filename.replace("/", "_").replace("\\", "_")
    filepath = os.path.join(UPLOAD_DIR, safe_name)
    # Avoid overwriting: add suffix if exists
    base, ext = os.path.splitext(filepath)
    i = 1
    final_path = filepath
    while os.path.exists(final_path):
        final_path = f"{base}_{i}{ext}"
        i += 1
    with open(final_path, 'wb') as out:
        out.write(file.file.read())

    # Public URL path (served under /uploads)
    public_url = "/uploads/" + os.path.basename(final_path)
    obj = models.GalleryImage(title=title, image_url=public_url, created_by=admin.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{image_id}/reactions", response_model=schemas.ReactionOut)
def get_image_reactions(image_id: int, db: Session = Depends(get_db), current_user: models.User | None = Depends(get_optional_user)):
    likes = db.query(func.count(models.GalleryReaction.id)).filter(models.GalleryReaction.image_id == image_id, models.GalleryReaction.value == 1).scalar() or 0
    dislikes = db.query(func.count(models.GalleryReaction.id)).filter(models.GalleryReaction.image_id == image_id, models.GalleryReaction.value == -1).scalar() or 0
    my = None
    if current_user:
        rec = (
            db.query(models.GalleryReaction)
            .filter(models.GalleryReaction.image_id == image_id, models.GalleryReaction.user_id == current_user.id)
            .first()
        )
        if rec:
            my = rec.value
    return {"likes": likes, "dislikes": dislikes, "my": my}


@router.put("/{image_id}/react", response_model=schemas.ReactionOut)
def react_image(image_id: int, payload: schemas.ReactionIn, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    img_exists = db.query(models.GalleryImage.id).filter(models.GalleryImage.id == image_id).first()
    if not img_exists:
        raise HTTPException(status_code=404, detail="Image not found")
    rec = (
        db.query(models.GalleryReaction)
        .filter(models.GalleryReaction.image_id == image_id, models.GalleryReaction.user_id == current_user.id)
        .first()
    )
    if rec and rec.value == payload.value:
        db.delete(rec)
    elif rec:
        rec.value = payload.value
        db.add(rec)
    else:
        db.add(models.GalleryReaction(image_id=image_id, user_id=current_user.id, value=payload.value))
    db.commit()
    return get_image_reactions(image_id, db, current_user)
