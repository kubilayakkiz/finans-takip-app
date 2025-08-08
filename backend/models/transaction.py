from sqlalchemy import Column, Integer, String, Date, Float, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(10))
    project_id = Column(Integer, ForeignKey("projects.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    date = Column(Date)
    amount = Column(Numeric(12,2))
    currency = Column(String(5))
    description = Column(String(255))
    tl_total = Column(Numeric(18,2))  # <-- EKLENDİ
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    category = relationship("Category")
