from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models
from .routers import auth, api_keys, wallets

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
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(api_keys.router, prefix="/api", tags=["api-keys"])
app.include_router(wallets.router, prefix="/api", tags=["wallets"])

@app.get("/")
async def root():
    return {"message": "Welcome to Cloud Server API"} 