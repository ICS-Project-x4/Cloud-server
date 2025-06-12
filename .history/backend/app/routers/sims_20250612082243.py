from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.sim import Sim, SimStatus
from ..models.wallet import Transaction, TransactionType, TransactionStatus
from ..schemas.sim import Sim as SimSchema, SimCreate, SimUpdate
from ..auth.dependencies import get_current_active_user

router = APIRouter()

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

    # Create the SIM
    db_sim = Sim(
        **sim.model_dump(),
        user_id=current_user.id,
        status=SimStatus.INACTIVE
    )
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