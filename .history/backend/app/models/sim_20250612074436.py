from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class SimStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    EXPIRED = "expired"

class Sim(Base):
    __tablename__ = "sims"

    id = Column(Integer, primary_key=True, index=True)
    iccid = Column(String, unique=True, index=True)  # SIM card identifier
    phone_number = Column(String, unique=True, index=True)
    status = Column(Enum(SimStatus), default=SimStatus.INACTIVE)
    expiry_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    messages_used = Column(Integer, default=0)
    messages_limit = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="sims")
    sms = relationship("SMS", back_populates="sim") 