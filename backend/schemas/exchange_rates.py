from pydantic import BaseModel
from datetime import date

class ExchangeRateBase(BaseModel):
    currency: str
    rate_to_try: float
    date: date

class ExchangeRateCreate(ExchangeRateBase):
    pass

class ExchangeRateUpdate(ExchangeRateBase):
    pass

class ExchangeRateResponse(ExchangeRateBase):
    id: int

    class Config:
        from_attributes = True
