from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Transaction, Project, Category, ExchangeRate
from schemas import TransactionCreate, TransactionUpdate, TransactionListResponse, TransactionResponse

router = APIRouter()

# 📌 Tüm işlemleri listele (arama + sayfalama + sıralama)
@router.get("/transactions", response_model=TransactionListResponse)
def get_transactions(
    search: str = Query("", description="Açıklama veya proje/kategori adına göre ara"),
    skip: int = 0,
    limit: int = 10,
    sort_by: str = Query("id", description="Sıralanacak sütun adı"),
    sort_order: str = Query("asc", description="Sıralama yönü: asc veya desc"),
    db: Session = Depends(get_db)
):
    # JOIN ile proje ve kategori adlarını almak
    query = (
        db.query(
            Transaction.id,
            Transaction.type,
            Transaction.project_id,
            Transaction.category_id,
            Project.name.label("project_name"),
            Category.name.label("category_name"),
            Transaction.date,
            Transaction.amount,
            Transaction.currency,
            Transaction.description,
            Transaction.tl_total,
            Transaction.created_at,
        )
        .join(Project, Transaction.project_id == Project.id)
        .join(Category, Transaction.category_id == Category.id)
    )

    # Arama
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) |
            (Category.name.ilike(f"%{search}%")) |
            (Transaction.type.ilike(f"%{search}%")) |
            (Transaction.currency.ilike(f"%{search}%")) |
            (Transaction.description.ilike(f"%{search}%"))
        )

    # Sıralama
    valid_sort_columns = {
        "id": Transaction.id,
        "type": Transaction.type,
        "project_name": Project.name,
        "category_name": Category.name,
        "date": Transaction.date,
        "amount": Transaction.amount,
        "currency": Transaction.currency,
        "created_at": Transaction.created_at,
        "tl_total": Transaction.tl_total,
    }
    sort_column = valid_sort_columns.get(sort_by, Transaction.id)
    if sort_order.lower() == "desc":
        sort_column = sort_column.desc()

    query = query.order_by(sort_column)

    total = query.count()
    records = query.offset(skip).limit(limit).all()

    items = [
        {
            "id": r.id,
            "type": r.type,
            "project_id": r.project_id,          # düzelt
            "category_id": r.category_id,        # düzelt
            "project_name": r.project_name,
            "category_name": r.category_name,
            "date": r.date,
            "amount": r.amount,
            "currency": r.currency,
            "description": r.description,
            "tl_total": r.tl_total,
            "created_at": r.created_at,
        }
        for r in records
    ]

    return {"total": total, "items": items}

# 📌 Yeni işlem ekle
@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # TL toplam hesapla
    tl_total = transaction.amount
    if transaction.currency.upper() not in ["TL", "TRY"]:
        rate = (
            db.query(ExchangeRate)
            .filter(
                func.upper(ExchangeRate.currency) == transaction.currency.upper(),
                ExchangeRate.date <= transaction.date
            )
            .order_by(ExchangeRate.date.desc())
            .first()
        )
        if rate and rate.rate_to_try:
            try:
                tl_total = float(transaction.amount) * float(rate.rate_to_try)
            except Exception:
                tl_total = None
        else:
            tl_total = None

    new_tr = Transaction(**transaction.dict(), tl_total=tl_total)
    db.add(new_tr)
    db.commit()
    db.refresh(new_tr)
    return new_tr

# 📌 İşlem güncelle
@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, updated: TransactionUpdate, db: Session = Depends(get_db)):
    tr = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı.")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(tr, field, value)

    # TL toplamı güncelle
    tl_total = tr.amount
    if tr.currency.upper() not in ["TL", "TRY"]:
        rate = (
            db.query(ExchangeRate)
            .filter(
                func.upper(ExchangeRate.currency) == tr.currency.upper(),
                ExchangeRate.date <= tr.date
            )
            .order_by(ExchangeRate.date.desc())
            .first()
        )
        if rate and rate.rate_to_try:
            try:
                tl_total = float(tr.amount) * float(rate.rate_to_try)
            except Exception:
                tl_total = None
        else:
            tl_total = None

    tr.tl_total = tl_total

    db.commit()
    db.refresh(tr)
    return tr

# 📌 İşlem sil
@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tr = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı.")

    db.delete(tr)
    db.commit()
    return {"message": "Kayıt silindi."}
