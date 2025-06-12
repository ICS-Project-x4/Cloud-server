from pydantic import BaseModel, condecimal
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class TransactionBase(BaseModel):
    type: str
    amount: Decimal
    description: str

class TransactionCreate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    id: int
    wallet_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass

class WalletBase(BaseModel):
    balance: Decimal

class WalletCreate(WalletBase):
    pass

class WalletUpdate(BaseModel):
    balance: Optional[Decimal] = None

class WalletInDBBase(WalletBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Wallet(WalletInDBBase):
    transactions: List[Transaction] = [] 