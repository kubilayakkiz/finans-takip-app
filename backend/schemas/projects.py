from pydantic import BaseModel
from datetime import datetime
from typing import List

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True  # ✅ SQLAlchemy objelerini JSON'a dönüştürmek için gerekli

class ProjectListResponse(BaseModel):
    total: int
    items: List[ProjectResponse]

    class Config:
        orm_mode = True
