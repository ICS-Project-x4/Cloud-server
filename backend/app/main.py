from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base
from . import models
from .routers import auth_router, api_keys_router, wallets_router, sims_router, sms_router
from .config import get_settings

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Server API",
    description="Backend API for Cloud Server application",
    version="1.0.0",
    # Disable automatic database creation
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with correct prefixes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(api_keys_router, prefix="/api/api-keys", tags=["api-keys"])
app.include_router(wallets_router, prefix="/api/wallets", tags=["wallets"])
app.include_router(sims_router, prefix="/api/sims", tags=["sims"])
app.include_router(sms_router, prefix="/api/sms", tags=["sms"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Cloud Server API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    ) 