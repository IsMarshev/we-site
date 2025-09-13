from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class CommentCreate(BaseModel):
    author: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1, max_length=2000)


class CommentOut(BaseModel):
    id: int
    place_id: int
    author: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None


class PlaceCreate(PlaceBase):
    pass


class PlaceOut(PlaceBase):
    id: int
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class PlaceDetail(PlaceOut):
    comments: List[CommentOut] = []


class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=3000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


# Auth
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=200)


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginInput(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Gallery
class GalleryCreateUrl(BaseModel):
    title: Optional[str] = None
    image_url: str


class GalleryOut(BaseModel):
    id: int
    title: Optional[str]
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# Reactions
from pydantic import field_validator


class ReactionIn(BaseModel):
    value: int

    @field_validator('value')
    @classmethod
    def check_value(cls, v: int):
        if v not in (-1, 1):
            raise ValueError('value must be -1 or 1')
        return v


class ReactionOut(BaseModel):
    likes: int
    dislikes: int
    my: Optional[int] = None
