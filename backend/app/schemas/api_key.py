from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApiKeyBase(BaseModel):
    name: str

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class ApiKeyInDBBase(ApiKeyBase):
    id: int
    user_id: int
    key: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApiKey(ApiKeyInDBBase):
    pass

class ApiKeyInDB(ApiKeyInDBBase):
    pass 