from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.sms import SMS, SMSStatus, SMSDirection
from ..models.sim import Sim
from ..models.wallet import Transaction, TransactionType, Wallet
from ..schemas.sms import SMSCreate, SMSUpdate, SMS as SMSSchema, SMSInDB
from ..auth.dependencies import get_current_user
from ..models.user import User

router = APIRouter(
    tags=["sms"]
)

@router.post("/send", response_model=SMSSchema)
async def send_sms(
    sms: SMSCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if SIM exists and belongs to user
    sim = db.query(Sim).filter(Sim.id == sms.sim_id, Sim.user_id == current_user.id).first()
    if not sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found or does not belong to user"
        )

    # Check if SIM is active
    if not sim.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SIM is not active"
        )

    # Check message limit
    if sim.messages_used >= sim.messages_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message limit reached for this SIM"
        )

    # Get user's wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User wallet not found"
        )

    # Check if user has enough balance
    if wallet.balance < 1:  # Cost per message
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )

    # Create transaction for the SMS
    transaction = Transaction(
        user_id=current_user.id,
        wallet_id=wallet.id,  # Associate with user's wallet
        amount=-1,  # Cost per message
        type=TransactionType.DEBIT,
        description=f"SMS sent to {sms.recipient_number}"
    )
    db.add(transaction)
    db.flush()

    # Update wallet balance
    wallet.balance -= 1  # Deduct cost per message

    # Create SMS record
    db_sms = SMS(
        user_id=current_user.id,
        sim_id=sms.sim_id,
        transaction_id=transaction.id,
        recipient_number=sms.recipient_number,
        sender_number=sim.phone_number,
        content=sms.content,
        status=SMSStatus.PENDING,
        direction=SMSDirection.OUTBOUND
    )
    db.add(db_sms)

    # Update SIM message count
    sim.messages_used += 1

    try:
        # TODO: Integrate with actual SMS provider API here
        # For now, we'll just mark it as sent
        db_sms.status = SMSStatus.SENT
        transaction.status = TransactionStatus.COMPLETED
        db.commit()
        return db_sms
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[SMSInDB])
async def list_sms(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sms_list = db.query(SMS).filter(SMS.user_id == current_user.id).offset(skip).limit(limit).all()
    return sms_list

@router.get("/{sms_id}", response_model=SMSInDB)
async def get_sms(
    sms_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sms = db.query(SMS).filter(SMS.id == sms_id, SMS.user_id == current_user.id).first()
    if not sms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS not found"
        )
    return sms

@router.patch("/{sms_id}", response_model=SMSInDB)
async def update_sms_status(
    sms_id: int,
    sms_update: SMSUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_sms = db.query(SMS).filter(SMS.id == sms_id, SMS.user_id == current_user.id).first()
    if not db_sms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS not found"
        )

    for field, value in sms_update.dict(exclude_unset=True).items():
        setattr(db_sms, field, value)

    db.commit()
    db.refresh(db_sms)
    return db_sms

@router.post("/webhook/receive", response_model=SMSInDB)
async def receive_sms(
    sender_number: str,
    content: str,
    db: Session = Depends(get_db)
):
    # Find the SIM with the matching phone number
    sim = db.query(Sim).filter(Sim.phone_number == sender_number).first()
    if not sim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SIM not found for this phone number"
        )

    # Create SMS record for received message
    db_sms = SMS(
        user_id=sim.user_id,
        sim_id=sim.id,
        recipient_number=sim.phone_number,
        sender_number=sender_number,
        content=content,
        status=SMSStatus.RECEIVED,
        direction=SMSDirection.INBOUND
    )
    db.add(db_sms)
    db.commit()
    db.refresh(db_sms)
    return db_sms 