from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
from ..database import get_db
from ..models.user import User
from ..models.api_key import ApiKey
from ..schemas.api_key import ApiKey as ApiKeySchema, ApiKeyCreate
from ..auth.dependencies import get_current_active_user

router = APIRouter()

@router.post("/", response_model=ApiKeySchema)
def create_api_key(
    api_key: ApiKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Generate a secure random API key
    key = secrets.token_urlsafe(32)
    db_api_key = ApiKey(
        name=api_key.name,
        key=key,
        user_id=current_user.id
    )
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key

@router.get("/", response_model=List[ApiKeySchema])
def read_api_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    api_keys = db.query(ApiKey).filter(ApiKey.user_id == current_user.id).all()
    return api_keys

@router.delete("/{api_key_id}")
def delete_api_key(
    api_key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    api_key = db.query(ApiKey).filter(
        ApiKey.id == api_key_id,
        ApiKey.user_id == current_user.id
    ).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    db.delete(api_key)
    db.commit()
    return {"message": "API key deleted successfully"} 