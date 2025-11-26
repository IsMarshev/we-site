import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import Base, engine, SessionLocal
from . import models
from .routers import places as places_router
from .routers import comments as comments_router
from .routers import contacts as contacts_router
from .routers import auth as auth_router
from .routers import gallery as gallery_router


def create_app() -> FastAPI:
    app = FastAPI(title="Cape Town Travel API", version="1.0.0")

    origins = os.environ.get("CT_ALLOWED_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create tables and run lightweight migrations for SQLite
    Base.metadata.create_all(bind=engine)
    run_light_migrations()

    # Seed initial data if empty
    seed_initial_data()

    # Include routers
    app.include_router(places_router.router)
    app.include_router(comments_router.router)
    app.include_router(contacts_router.router)
    app.include_router(auth_router.router)
    app.include_router(gallery_router.router)

    # Serve uploads
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
    if os.path.isdir(upload_dir):
        app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

    # Serve frontend build if present
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    if os.path.isdir(frontend_dir):
        app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            index_path = os.path.join(frontend_dir, "index.html")
            return FileResponse(index_path)

    return app


def seed_initial_data():
    db: Session = SessionLocal()
    try:
        # Ensure default admin user exists
        admin_exists = db.query(models.User.id).filter(models.User.username == "admin").first()
        if not admin_exists:
            try:
                from .auth import get_password_hash
                admin_user = models.User(
                    username="admin",
                    email="admin@example.com",
                    hashed_password=get_password_hash("pioner18"),
                    role="admin",
                )
                db.add(admin_user)
                db.commit()
            except Exception:
                db.rollback()

        # If any place exists, skip
        has_place = db.query(models.Place.id).first()
        if has_place:
            return

        places = [
            models.Place(
                name="Table Mountain",
                description="Iconic flat-topped mountain with sweeping views of Cape Town.",
                latitude=-33.9628,
                longitude=18.4098,
                image_url="https://images.unsplash.com/photo-1583266094121-6c6f8f5779c4?q=80&w=1200&auto=format&fit=crop",
            ),
            models.Place(
                name="V&A Waterfront",
                description="Vibrant harbor with shops, restaurants, and beautiful waterfront views.",
                latitude=-33.9036,
                longitude=18.4204,
                image_url="https://images.unsplash.com/photo-1606581538094-6ab696648efa?q=80&w=1200&auto=format&fit=crop",
            ),
            models.Place(
                name="Cape Point",
                description="Dramatic cliffs and lighthouse at the tip of the Cape Peninsula.",
                latitude=-34.3573,
                longitude=18.4977,
                image_url="https://images.unsplash.com/photo-1599743818179-1fb26a40cc1b?q=80&w=1200&auto=format&fit=crop",
            ),
            models.Place(
                name="Camps Bay Beach",
                description="White sand beach backed by the Twelve Apostles mountain range.",
                latitude=-33.9510,
                longitude=18.3772,
                image_url="https://images.unsplash.com/photo-1601650080075-ecff6a221073?q=80&w=1200&auto=format&fit=crop",
            ),
            models.Place(
                name="Bo-Kaap",
                description="Historic neighborhood known for its colorful houses and Cape Malay culture.",
                latitude=-33.9201,
                longitude=18.4141,
                image_url="https://images.unsplash.com/photo-1602467181047-3b60ae3c1055?q=80&w=1200&auto=format&fit=crop",
            ),
        ]
        db.add_all(places)
        db.commit()
    finally:
        db.close()


def run_light_migrations():
    """Minimal SQLite migrations to avoid breaking existing DBs.
    Adds missing columns introduced after initial release.
    """
    with engine.begin() as conn:
        # Add created_by to places if missing
        try:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(places)").fetchall()]
            if "created_by" not in cols:
                conn.exec_driver_sql("ALTER TABLE places ADD COLUMN created_by INTEGER")
        except Exception:
            pass
        # Add role to users if missing
        try:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()]
            if "role" not in cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
                conn.exec_driver_sql("UPDATE users SET role='user' WHERE role IS NULL")
        except Exception:
            pass
        # Create gallery_images if not exists
        try:
            conn.exec_driver_sql("SELECT 1 FROM gallery_images LIMIT 1")
        except Exception:
            # table missing -> create via metadata
            Base.metadata.create_all(bind=engine)
        # Add client_id to reactions tables for anonymous likes
        try:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(place_reactions)").fetchall()]
            if "client_id" not in cols:
                conn.exec_driver_sql("ALTER TABLE place_reactions ADD COLUMN client_id VARCHAR(120)")
            conn.exec_driver_sql(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_place_reaction_client ON place_reactions (place_id, client_id)"
            )
        except Exception:
            pass
        try:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(gallery_reactions)").fetchall()]
            if "client_id" not in cols:
                conn.exec_driver_sql("ALTER TABLE gallery_reactions ADD COLUMN client_id VARCHAR(120)")
            conn.exec_driver_sql(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_gallery_reaction_client ON gallery_reactions (image_id, client_id)"
            )
        except Exception:
            pass


app = create_app()
