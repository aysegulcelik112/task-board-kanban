"""
Etiket (Label) endpoint'leri
Görevleri kategorize etmek için renkli etiketler
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/labels", tags=["Labels"])


@router.post("/", response_model=schemas.LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(
    label_data: schemas.LabelCreate,
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Panoya yeni etiket ekler"""
    # Pano kontrolü
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Pano bulunamadı")
    
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu panoya etiket ekleme yetkiniz yok")
    
    # Yeni etiket oluştur
    new_label = models.Label(
        name=label_data.name,
        color=label_data.color,
        board_id=board_id
    )
    
    db.add(new_label)
    db.commit()
    db.refresh(new_label)
    
    return new_label


@router.get("/", response_model=List[schemas.LabelResponse])
def get_labels(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Panonun tüm etiketlerini listeler"""
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Erişim reddedildi")
    
    labels = db.query(models.Label).filter(models.Label.board_id == board_id).all()
    return labels


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Etiketi siler"""
    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Etiket bulunamadı")
    
    # Yetki kontrolü
    if label.board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu etiketi silme yetkiniz yok")
    
    db.delete(label)
    db.commit()
    return None
