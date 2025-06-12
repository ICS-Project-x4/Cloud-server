from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.sim import SimStatus

class SimBase(BaseModel):
    iccid: str
    phone_number: str
    data_plan: str
    expiry_date: datetime

class SimCreate(SimBase):
    pass

class SimUpdate(BaseModel):
    status: Optional[SimStatus] = None
    data_plan: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    messages_limit: Optional[int] = None
    messages_used: Optional[int] = None

class SimInDBBase(SimBase):
    id: int
    status: SimStatus
    is_active: bool
    user_id: int
    messages_limit: int
    messages_used: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Sim(SimInDBBase):
    pass 