import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from app.core.database import engine, Base, get_db
from app.api.router import api_router
from app.db.seed import seed_database
import app.models as models

load_dotenv()

# Create database tables automatically
Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute", "20/second"])

app = FastAPI(
    title="Typeform Clone API",
    description="Backend API for Typeform Builder, Respondent Flow, and Analytics",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(api_router)


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        count = db.query(models.Form).count()
        if count == 0:
            print("Empty database detected. Auto-seeding initial forms...")
            seed_database()
    except Exception as e:
        print(f"Startup check error: {e}")


@app.get("/")
def root():
    return {"status": "ok", "app": "Typeform Clone API", "version": "1.0.0"}


@app.post("/api/seed")
def trigger_seed(request: Request, creator_id: str = "default_creator"):
    host = request.client.host if request.client else ""
    if host not in ("127.0.0.1", "localhost", "::1"):
        raise HTTPException(status_code=403, detail="Seed endpoint only available locally")
    try:
        result = seed_database(force=True, creator_id=creator_id)
        if result is None:
            return {"message": "Database already has data. Use ?force=true to re-seed."}
        return {"message": "Database re-seeded successfully with realistic forms and responses!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Seeding failed")