from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class TransactionBase(BaseModel):
    type: str
    project_id: int
    category_id: int
    date: date
    amount: float
    currency: str
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    tl_total: Optional[float]  # TL karşılığı

    # EKLE!
    project_name: Optional[str] = None
    category_name: Optional[str] = None

    class Config:
        orm_mode = True

class TransactionListResponse(BaseModel):
    total: int
    items: List[TransactionResponse]

    class Config:
        orm_mode = True
