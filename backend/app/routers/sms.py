from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.sms import SMS, SMSStatus, SMSDirection
from ..models.sim import Sim
from ..models.wallet import Transaction, TransactionType, TransactionStatus, Wallet
from ..schemas.sms import SMSCreate, SMSUpdate, SMS as SMSSchema, SMSInDB
from ..auth.dependencies import get_current_user
from ..models.user import User
from ..services.mqtt import mqtt_service

router = APIRouter(
    tags=["sms"]
)

@router.get("/test-mqtt")
async def test_mqtt_connection():
    """Test MQTT connection and return status"""
    try:
        is_connected = mqtt_service.test_connection()
        if is_connected:
            return {"status": "success", "message": "MQTT connection successful"}
        else:
            return {"status": "error", "message": "MQTT connection failed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/send", response_model=List[SMSSchema])
async def send_sms(
    sms: SMSCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sent_messages = []
    total_cost = len(sms.sim_ids)  # Cost is 1 per message

    # Get user's wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User wallet not found"
        )

    # Check if user has enough balance for all messages
    if wallet.balance < total_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Need {total_cost} credits but only have {wallet.balance}"
        )

    # Check if all SIMs exist and belong to user
    sims = db.query(Sim).filter(
        Sim.id.in_(sms.sim_ids),
        Sim.user_id == current_user.id
    ).all()

    if len(sims) != len(sms.sim_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more SIMs not found or do not belong to user"
        )

    # Check if all SIMs are active and have available messages
    for sim in sims:
        if not sim.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SIM {sim.id} is not active"
            )
        if sim.messages_used >= sim.messages_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Message limit reached for SIM {sim.id}"
            )

    try:
        # Create transaction for all messages
        transaction = Transaction(
            user_id=current_user.id,
            wallet_id=wallet.id,
            amount=-total_cost,
            type=TransactionType.DEBIT,
            description=f"Bulk SMS sent to {sms.recipient_number} via {len(sims)} SIMs"
        )
        db.add(transaction)
        db.flush()

        # Update wallet balance
        wallet.balance -= total_cost

        # Send message through each SIM
        for sim in sims:
            # Create SMS record
            db_sms = SMS(
                user_id=current_user.id,
                sim_id=sim.id,
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

            # Send message via MQTT
            mqtt_success = mqtt_service.send_sms(sms.recipient_number, sms.content)
            
            if mqtt_success:
                db_sms.status = SMSStatus.SENT
            else:
                db_sms.status = SMSStatus.FAILED
                db_sms.error_message = "Failed to send message via MQTT"

            sent_messages.append(db_sms)

        # Update transaction status based on overall success
        if all(msg.status == SMSStatus.SENT for msg in sent_messages):
            transaction.status = TransactionStatus.COMPLETED
        else:
            transaction.status = TransactionStatus.FAILED

        db.commit()
        return sent_messages

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
    return [
        {
            **sms.__dict__,
            "user": sms.user,
            "sim": sms.sim,
            "transaction": {
                **sms.transaction.__dict__,
                "wallet": sms.transaction.wallet
            } if sms.transaction else None
        }
        for sms in sms_list
    ]

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