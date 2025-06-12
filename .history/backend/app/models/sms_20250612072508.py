from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class SMSStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RECEIVED = "received"

class SMSDirection(str, enum.Enum):
    OUTBOUND = "outbound"  # Message sent from our system
    INBOUND = "inbound"    # Message received by our system

class SMS(Base):
    __tablename__ = "sms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    sim_id = Column(Integer, ForeignKey("sims.id"))
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)  # For outbound messages that cost money
    
    # Message details
    direction = Column(Enum(SMSDirection))
    status = Column(Enum(SMSStatus), default=SMSStatus.PENDING)
    recipient_number = Column(String)  # For outbound messages
    sender_number = Column(String)     # For inbound messages
    content = Column(Text)
    price = Column(Integer, default=0)  # Price in cents
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Error tracking
    error_message = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="sms")
    sim = relationship("Sim", back_populates="sms")
    transaction = relationship("Transaction", back_populates="sms") 