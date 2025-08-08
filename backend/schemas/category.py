from pydantic import BaseModel
from datetime import datetime
from typing import List

class CategoryBase(BaseModel):
    type: str
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryListResponse(BaseModel):
    total: int
    items: List[CategoryResponse]

    class Config:
        from_attributes = True
