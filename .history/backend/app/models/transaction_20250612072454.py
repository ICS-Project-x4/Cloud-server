from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class TransactionType(str, enum.Enum):
    CREDIT = "credit"
    DEBIT = "debit"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2))
    type = Column(Enum(TransactionType))
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    sms = relationship("SMS", back_populates="transaction") 