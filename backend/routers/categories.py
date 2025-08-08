from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Category
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse

router = APIRouter()

# 📌 Kategori Listesi (arama + sayfalama + sıralama)
@router.get("/categories", response_model=CategoryListResponse)
def get_categories(
    search: str = Query("", description="Kategori adına göre ara"),
    skip: int = 0,
    limit: int = 10,
    sort_by: str = Query("id", description="Sıralanacak sütun adı (id, type, name, created_at)"),
    sort_order: str = Query("asc", description="Sıralama yönü: asc veya desc"),
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))

    if sort_by not in ["id", "type", "name", "created_at"]:
        sort_by = "id"

    sort_column = getattr(Category, sort_by)
    if sort_order.lower() == "desc":
        sort_column = sort_column.desc()

    query = query.order_by(sort_column)

    total = query.count()
    categories = query.offset(skip).limit(limit).all()
    return {"total": total, "items": categories}

# 📌 Kategori Ekle
@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    if category.type.lower() not in ["gelir", "gider"]:
        raise HTTPException(status_code=400, detail="Kategori tipi 'gelir' veya 'gider' olmalı.")

    existing = (
        db.query(Category)
        .filter(Category.type == category.type, Category.name.ilike(category.name))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bu tip ve isimde kategori zaten var.")

    new_category = Category(type=category.type, name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# 📌 Kategori Güncelle
@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, updated: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı.")

    if updated.type.lower() not in ["gelir", "gider"]:
        raise HTTPException(status_code=400, detail="Kategori tipi 'gelir' veya 'gider' olmalı.")

    existing = (
        db.query(Category)
        .filter(Category.type == updated.type, Category.name.ilike(updated.name), Category.id != category_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bu tip ve isimde başka bir kategori var.")

    category.type = updated.type
    category.name = updated.name
    db.commit()
    db.refresh(category)
    return category

# 📌 Kategori Sil
@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı.")

    db.delete(category)
    db.commit()
    return {"message": "Kategori silindi."}
