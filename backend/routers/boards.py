"""
Pano (Board) endpoint'leri
Kullanıcılar birden fazla pano oluşturabilir
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/boards", tags=["Boards"])


@router.post("/", response_model=schemas.BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    board_data: schemas.BoardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Yeni pano oluşturur
    - Kullanıcı giriş yapmış olmalı
    - Her kullanıcı istediği kadar pano oluşturabilir
    """
    new_board = models.Board(
        title=board_data.title,
        description=board_data.description,
        owner_id=current_user.id
    )
    
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    
    return new_board


@router.get("/", response_model=List[schemas.BoardResponse])
def get_boards(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Kullanıcının tüm panolarını listeler
    - Sadece kullanıcının kendi panoları gösterilir
    - Oluşturulma tarihine göre sıralanır (en yeni en başta)
    """
    boards = db.query(models.Board).filter(
        models.Board.owner_id == current_user.id
    ).order_by(models.Board.created_at.desc()).all()
    
    return boards


@router.get("/{board_id}", response_model=schemas.BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Belirli bir panoyu getirir
    """
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    # Pano kullanıcıya ait mi?
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panoyu görüntüleme yetkiniz yok"
        )
    
    return board


@router.put("/{board_id}", response_model=schemas.BoardResponse)
def update_board(
    board_id: int,
    board_data: schemas.BoardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Panoyu günceller
    - Başlık ve açıklama güncellenebilir
    """
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    # Pano kullanıcıya ait mi?
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panoyu güncelleme yetkiniz yok"
        )
    
    # Sadece gönderilen alanları güncelle
    update_data = board_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(board, key, value)
    
    db.commit()
    db.refresh(board)
    
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Panoyu siler
    - Pano silindiğinde altındaki tüm görevler, etiketler ve yorumlar da silinir (cascade)
    - DİKKAT: Bu işlem geri alınamaz!
    """
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    # Pano kullanıcıya ait mi?
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panoyu silme yetkiniz yok"
        )
    
    db.delete(board)
    db.commit()
    
    return None  # 204 No Content
