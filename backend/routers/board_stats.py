"""
Pano istatistikleri endpoint'leri
Görev durumlarına göre özet bilgiler
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db
from auth import get_current_user
from pydantic import BaseModel
from typing import Dict

router = APIRouter(prefix="/boards", tags=["Board Stats"])


class TaskStatusCounts(BaseModel):
    """Görev durum sayıları"""
    todo: int = 0
    in_progress: int = 0
    done: int = 0
    total: int = 0


class BoardStats(BaseModel):
    """Pano istatistikleri"""
    board_id: int
    board_title: str
    task_counts: TaskStatusCounts
    completion_rate: float  # Tamamlanma oranı (%)
    

@router.get("/{board_id}/stats", response_model=BoardStats)
def get_board_stats(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Bir panonun istatistiklerini getirir
    - Duruma göre görev sayıları
    - Tamamlanma oranı
    """
    # Pano var mı ve kullanıcıya ait mi?
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panonun istatistiklerini görüntüleme yetkiniz yok"
        )
    
    # Durum bazında görev sayıları - SQL GROUP BY kullan (performanslı)
    status_counts = db.query(
        models.Task.status,
        func.count(models.Task.id).label('count')
    ).filter(
        models.Task.board_id == board_id
    ).group_by(models.Task.status).all()
    
    # Sonuçları dictionary'e çevir
    counts_dict = {status: count for status, count in status_counts}
    
    task_counts = TaskStatusCounts(
        todo=counts_dict.get('todo', 0),
        in_progress=counts_dict.get('in_progress', 0),
        done=counts_dict.get('done', 0),
        total=sum(counts_dict.values())
    )
    
    # Tamamlanma oranı hesapla
    completion_rate = 0.0
    if task_counts.total > 0:
        completion_rate = (task_counts.done / task_counts.total) * 100
    
    return BoardStats(
        board_id=board.id,
        board_title=board.title,
        task_counts=task_counts,
        completion_rate=round(completion_rate, 2)
    )


@router.patch("/{board_id}/tasks/{task_id}/status")
def update_task_status(
    board_id: int,
    task_id: int,
    new_status: str,
    new_position: int = 0,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Görevin durumunu günceller (sürükle-bırak için özel endpoint)
    - Yeni durum ve pozisyon bilgisi alır
    - Frontend'den sürükle-bırak işlemi sonrası çağrılır
    """
    # Pano kontrolü
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panoya erişim yetkiniz yok"
        )
    
    # Görev kontrolü
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.board_id == board_id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Görev bulunamadı"
        )
    
    # Durum validasyonu
    valid_statuses = ["todo", "in_progress", "done"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Geçersiz durum. Geçerli değerler: {', '.join(valid_statuses)}"
        )
    
    # Görev durumunu güncelle
    task.status = new_status
    task.position = new_position
    
    db.commit()
    db.refresh(task)
    
    return {
        "message": "Görev durumu güncellendi",
        "task_id": task.id,
        "new_status": task.status,
        "new_position": task.position
    }
