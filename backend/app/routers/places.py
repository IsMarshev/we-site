from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, get_optional_user, require_admin
from sqlalchemy import func


router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("/", response_model=List[schemas.PlaceOut])
def list_places(db: Session = Depends(get_db)):
    return db.query(models.Place).order_by(models.Place.id.asc()).all()


@router.get("/{place_id}", response_model=schemas.PlaceDetail)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.post("/", response_model=schemas.PlaceOut, status_code=201)
def create_place(
    place: schemas.PlaceCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    obj = models.Place(
        name=place.name,
        description=place.description,
        latitude=place.latitude,
        longitude=place.longitude,
        image_url=place.image_url,
        created_by=admin.id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{place_id}", response_model=schemas.PlaceOut)
def update_place(
    place_id: int,
    payload: schemas.PlaceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    # Only admin or creator can edit
    if (getattr(current_user, 'role', 'user') != 'admin') and (place.created_by != current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to edit this place")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(place, k, v)
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.get("/{place_id}/reactions", response_model=schemas.ReactionOut)
def get_place_reactions(
    place_id: int,
    client_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
    likes = db.query(func.count(models.PlaceReaction.id)).filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.value == 1).scalar() or 0
    dislikes = db.query(func.count(models.PlaceReaction.id)).filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.value == -1).scalar() or 0
    my = None
    if current_user:
        rec = (
            db.query(models.PlaceReaction)
            .filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.user_id == current_user.id)
            .first()
        )
        if rec:
            my = rec.value
    elif client_id:
        rec = (
            db.query(models.PlaceReaction)
            .filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.client_id == client_id)
            .first()
        )
        if rec:
            my = rec.value
    return {"likes": likes, "dislikes": dislikes, "my": my}


@router.put("/{place_id}/react", response_model=schemas.ReactionOut)
def react_place(
    place_id: int,
    payload: schemas.ReactionIn,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
    place_exists = db.query(models.Place.id).filter(models.Place.id == place_id).first()
    if not place_exists:
        raise HTTPException(status_code=404, detail="Place not found")
    client_id = (payload.client_id or "").strip() or None
    if not current_user and not client_id:
        raise HTTPException(status_code=400, detail="client_id is required for anonymous reactions")
    if current_user:
        rec = (
            db.query(models.PlaceReaction)
            .filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.user_id == current_user.id)
            .first()
        )
    else:
        rec = (
            db.query(models.PlaceReaction)
            .filter(models.PlaceReaction.place_id == place_id, models.PlaceReaction.client_id == client_id)
            .first()
        )
    if rec and rec.value == payload.value:
        db.delete(rec)
    elif rec:
        rec.value = payload.value
        db.add(rec)
    else:
        db.add(
            models.PlaceReaction(
                place_id=place_id,
                user_id=current_user.id if current_user else None,
                client_id=None if current_user else client_id,
                value=payload.value,
            )
        )
    db.commit()
    # Return updated counts
    return get_place_reactions(place_id, db=db, current_user=current_user, client_id=client_id)


@router.delete("/{place_id}", status_code=204)
def delete_place(place_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    if (getattr(current_user, 'role', 'user') != 'admin') and (place.created_by != current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to delete this place")
    db.delete(place)
    db.commit()
    return None
