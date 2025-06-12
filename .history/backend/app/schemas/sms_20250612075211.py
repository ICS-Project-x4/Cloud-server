from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import User
from .sim import Sim
from .wallet import Transaction

class SMSBase(BaseModel):
    recipient_number: str = Field(..., min_length=10, max_length=15)
    content: str = Field(..., min_length=1, max_length=1600)  # SMS can be up to 1600 characters (concatenated)

class SMSCreate(SMSBase):
    sim_id: int

class SMSUpdate(BaseModel):
    status: Optional[str] = None
    error_message: Optional[str] = None

class SMSInDBBase(SMSBase):
    id: int
    user_id: int
    sim_id: int
    transaction_id: Optional[int] = None
    sender_number: str
    status: str
    direction: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SMS(SMSInDBBase):
    pass

class SMSInDB(SMSInDBBase):
    user: User
    sim: Sim
    transaction: Optional[Transaction] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        } 