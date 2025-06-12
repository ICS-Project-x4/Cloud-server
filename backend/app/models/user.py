from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Use string references for relationships to avoid circular imports
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    api_keys = relationship("ApiKey", back_populates="user")
    sims = relationship("Sim", back_populates="user")
    sms = relationship("SMS", back_populates="user")
    transactions = relationship("Transaction", back_populates="user") 