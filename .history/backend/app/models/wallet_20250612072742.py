from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class TransactionType(str, enum.Enum):
    CREDIT = "credit"
    DEBIT = "debit"

class TransactionStatus(str, enum.Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    FAILED = "failed"

class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = {'extend_existing': True} # <--- ADD THIS

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Use string references for relationships to avoid circular imports
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = {'extend_existing': True} # <--- ADD THIS

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    type = Column(Enum(TransactionType))
    amount = Column(Numeric(10, 2))
    description = Column(String)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="transactions")
    # Use string reference for relationship to avoid circular imports
    wallet = relationship("Wallet", back_populates="transactions") 
    