from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from ..database import get_db
from ..models.user import User
from ..models.wallet import Wallet, Transaction, TransactionType, TransactionStatus
from ..schemas.wallet import Wallet as WalletSchema, Transaction as TransactionSchema, TransactionCreate
from ..auth.dependencies import get_current_active_user

router = APIRouter()

@router.get("/", response_model=WalletSchema)
def read_wallet(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        # Create a new wallet if it doesn't exist
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

@router.post("/transactions", response_model=TransactionSchema)
def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Create the transaction
    db_transaction = Transaction(
        wallet_id=wallet.id,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description,
        status=TransactionStatus.PENDING
    )
    db.add(db_transaction)
    
    # Update wallet balance
    if transaction.type == TransactionType.CREDIT:
        wallet.balance += transaction.amount
    else:  # DEBIT
        if wallet.balance < transaction.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds"
            )
        wallet.balance -= transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions", response_model=List[TransactionSchema])
def read_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []
    return db.query(Transaction).filter(Transaction.wallet_id == wallet.id).all() 