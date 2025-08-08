from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from schemas.user import UserCreate, UserLogin, UserOut
from auth import hash_password, verify_password, create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")
    
    hashed = hash_password(user.password)
    new_user = User(
                        email=user.email,
                        hashed_password=hashed,  # ← Doğru alan adı bu
                        first_name=user.first_name,
                        last_name=user.last_name,
                        phone=user.phone,
                        department=user.department,
                        role=user.role,
                    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre.")

    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}
