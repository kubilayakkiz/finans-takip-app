from fastapi import APIRouter, Depends
from auth import get_current_user, role_required
from models.user import User

router = APIRouter()

@router.get("/admin-only")
def admin_panel(current_user=Depends(role_required("admin"))):
    return {"message": "Welcome to admin panel"}
