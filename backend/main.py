from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal
from routers import auth, admin
from fastapi.middleware.cors import CORSMiddleware
from routers import projects
from routers import categories
from routers import transactions
from routers import exchange_rates


app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"  # bunu da ekledik!
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Router'ları ekle
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(exchange_rates.router, tags=["Exchanges"])
app.include_router(projects.router, tags=["Projects"])
app.include_router(categories.router, tags=["Categories"])
app.include_router(transactions.router, tags=["Transaction"])

# DB oturumu oluşturmak için dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Veritabanı bağlantısını test etmek için endpoint
@app.get("/ping-db")
def ping_database(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Veritabanı bağlantısı başarılı ✅"}
    except Exception as e:
        return {"status": "Veritabanı bağlantısı HATALI ❌", "error": str(e)}
