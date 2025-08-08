from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Project
from schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from typing import List

router = APIRouter()

# 📌 Proje Listesi (arama + sayfalama)
@router.get("/projects", response_model=ProjectListResponse)
def get_projects(
    search: str = Query("", description="Proje adına göre ara"),
    skip: int = 0,
    limit: int = 10,
    sort_by: str = Query("id", description="Sıralanacak sütun adı (id veya name)"),
    sort_order: str = Query("asc", description="Sıralama yönü: asc veya desc"),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))

    # Geçerli sütun mu kontrol et
    if sort_by not in ["id", "name", "created_at"]:
        sort_by = "id"

    # Sıralama
    sort_column = getattr(Project, sort_by)
    if sort_order.lower() == "desc":
        sort_column = sort_column.desc()
    query = query.order_by(sort_column)

    total = query.count()
    projects = query.offset(skip).limit(limit).all()
    return {"total": total, "items": projects}

# 📌 Proje Ekle
@router.post("/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.name.ilike(project.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu isimde bir proje zaten var.")

    new_project = Project(name=project.name)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# 📌 Proje Güncelle
@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, updated: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")

    existing = (
        db.query(Project)
        .filter(Project.name.ilike(updated.name), Project.id != project_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bu isimde başka bir proje var.")

    project.name = updated.name
    db.commit()
    db.refresh(project)
    return project

# 📌 Proje Sil
@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")

    db.delete(project)
    db.commit()
    return {"message": "Proje silindi."}
