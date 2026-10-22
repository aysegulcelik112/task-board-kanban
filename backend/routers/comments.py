"""
Yorum (Comment) endpoint'leri
Görevlere yorum ekleme ve yönetme
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Göreve yeni yorum ekler"""
    # Görev var mı ve kullanıcının panosunda mı kontrol et
    task = db.query(models.Task).filter(models.Task.id == comment_data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    
    if task.board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu göreve yorum ekleme yetkiniz yok")
    
    # Yorum oluştur
    new_comment = models.Comment(
        content=comment_data.content,
        task_id=comment_data.task_id,
        author_id=current_user.id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


@router.get("/", response_model=List[schemas.CommentResponse])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Görevin tüm yorumlarını listeler"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task or task.board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Erişim reddedildi")
    
    comments = db.query(models.Comment).filter(
        models.Comment.task_id == task_id
    ).order_by(models.Comment.created_at.desc()).all()
    
    return comments


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Yorumu siler (sadece yorum sahibi silebilir)"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    # Sadece yorum sahibi silebilir
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok")
    
    db.delete(comment)
    db.commit()
    return None
