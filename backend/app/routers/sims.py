from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.sim import Sim, SimStatus
from ..models.wallet import Transaction, TransactionType, TransactionStatus
from ..models.api_key import ApiKey
from ..schemas.sim import Sim as SimSchema, SimCreate, SimUpdate
from ..auth.dependencies import get_current_active_user
import httpx
from datetime import datetime

router = APIRouter()

async def get_edge_api_key():
    """Get API key from edge backend"""
    async with httpx.AsyncClient() as client:
        try:
            # First, get the JWT token
            auth_response = await client.post(
                "http://localhost:5001/api/auth",
                json={
                    "username": "admin",
                    "password": "admin123"
                }
            )
            auth_response.raise_for_status()
            auth_data = auth_response.json()
            
            # Return the API key from the response
            return auth_data.get("api_key")
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to get API key from edge backend: {str(e)}"
            )

@router.get("/marketplace", response_model=List[SimSchema])
async def get_all_sims_from_edge():
    """Get all SIM cards from the edge backend"""
    async with httpx.AsyncClient() as client:
        try:
            # Get the API key
            api_key = "5f427c4bc12f35af8648807151aa2742f5a98a929feebc8827162cc6885a9394"
            if not api_key:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to get API key from edge backend"
                )

            # Use the API key to get SIM cards
            response = await client.get(
                "http://192.168.95.187:5001/api/sim-cards",
                headers={
                    "X-API-Key": api_key
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Transform the edge backend data to match our schema
            transformed_sims = []
            current_time = datetime.utcnow()
            expiry_date = datetime.utcnow().replace(year=current_time.year + 1)  # 1 year from now
            
            for sim in data.get("sim_cards", []):
                transformed_sims.append({
                    "id": 0,  # Temporary ID since these are marketplace SIMs
                    "iccid": sim["id"],  # Using the edge backend's id as ICCID
                    "phone_number": sim["number"],
                    "status": SimStatus.ACTIVE ,
                    "is_active": sim["status"] == "active",
                    "messages_limit": 1000,  # Default value
                    "messages_used": 0,  # Default value
                    "user_id": 0,  # No user assigned yet
                    "expiry_date": expiry_date,
                    "created_at": current_time,
                    "updated_at": current_time
                })
            return transformed_sims
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch SIM cards from edge backend: {str(e)}"
            )

@router.get("/", response_model=List[SimSchema])
def read_sims(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all SIMs for the current user"""
    return db.query(Sim).filter(Sim.user_id == current_user.id).all()

@router.post("/", response_model=SimSchema)
def create_sim(
    sim: SimCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new SIM for the current user"""
    # Check if ICCID or phone number already exists
    existing_sim = db.query(Sim).filter(
        (Sim.iccid == sim.iccid) | (Sim.phone_number == sim.phone_number)
    ).first()
    if existing_sim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SIM with this ICCID or phone number already exists"
        )

    # Create the SIM with default values
    sim_data = sim.model_dump()
    sim_data.update({
        "user_id": current_user.id,
        "status": SimStatus.ACTIVE,  # Set as active by default
        "is_active": True,  # Set as active by default
        "messages_limit": 150,  # Default message limit
        "messages_used": 0  # Start with 0 messages used
    })
    
    db_sim = Sim(**sim_data)
    db.add(db_sim)
    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.get("/{sim_id}", response_model=SimSchema)
def read_sim(
    sim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific SIM by ID"""
    sim = db.query(Sim).filter(
        Sim.id == sim_id,
        Sim.user_id == current_user.id
    ).first()
    if not sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found"
        )
    return sim

@router.patch("/{sim_id}", response_model=SimSchema)
def update_sim(
    sim_id: int,
    sim_update: SimUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a SIM's details"""
    db_sim = db.query(Sim).filter(
        Sim.id == sim_id,
        Sim.user_id == current_user.id
    ).first()
    if not db_sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found"
        )

    # Update SIM details
    for field, value in sim_update.model_dump(exclude_unset=True).items():
        setattr(db_sim, field, value)

    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.post("/{sim_id}/activate", response_model=SimSchema)
def activate_sim(
    sim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Activate a SIM card"""
    db_sim = db.query(Sim).filter(
        Sim.id == sim_id,
        Sim.user_id == current_user.id
    ).first()
    if not db_sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found"
        )

    if db_sim.status == SimStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SIM is already active"
        )

    # Create activation transaction
    activation_fee = 10.00  # Example activation fee
    db_transaction = Transaction(
        wallet_id=current_user.wallet.id,
        type=TransactionType.DEBIT,
        amount=activation_fee,
        description=f"SIM activation fee for {db_sim.phone_number}",
        status=TransactionStatus.COMPLETED
    )
    db.add(db_transaction)

    # Update SIM status
    db_sim.status = SimStatus.ACTIVE
    db_sim.is_active = True

    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.post("/{sim_id}/deactivate", response_model=SimSchema)
def deactivate_sim(
    sim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deactivate a SIM card"""
    db_sim = db.query(Sim).filter(
        Sim.id == sim_id,
        Sim.user_id == current_user.id
    ).first()
    if not db_sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found"
        )

    if db_sim.status != SimStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SIM is not active"
        )

    db_sim.status = SimStatus.INACTIVE
    db_sim.is_active = False

    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.delete("/{sim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sim(
    sim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a SIM card"""
    db_sim = db.query(Sim).filter(
        Sim.id == sim_id,
        Sim.user_id == current_user.id
    ).first()
    if not db_sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found"
        )

    db.delete(db_sim)
    db.commit()
    return None 