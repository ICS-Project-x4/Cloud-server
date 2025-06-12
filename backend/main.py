from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, sims, sms, wallet, analytics
from app.services.mqtt import mqtt_service
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(sims.router, prefix="/api/sims", tags=["sims"])
app.include_router(sms.router, prefix="/api/sms", tags=["sms"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Connect to MQTT broker
        mqtt_service.connect()
        logger.info("MQTT service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MQTT service: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup services on shutdown"""
    try:
        # Disconnect from MQTT broker
        mqtt_service.disconnect()
        logger.info("MQTT service disconnected successfully")
    except Exception as e:
        logger.error(f"Error during MQTT service shutdown: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the SMS Gateway API"} 