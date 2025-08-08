from sqlalchemy import Column, Integer, String, Numeric, Date
from database import Base

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True)
    currency = Column(String)  # ✅
    rate_to_try = Column(Numeric)  # ✅
    date = Column(Date)  # ✅
