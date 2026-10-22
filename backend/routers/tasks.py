"""
Görev (Task) endpoint'leri
CRUD işlemleri: Create, Read, Update, Delete
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Yeni görev oluşturur
    - Kullanıcı giriş yapmış olmalı (JWT token gerekli)
    - Görev belirtilen panoya eklenir
    - Etiketler (labels) opsiyonel olarak eklenebilir
    """
    # Pano var mı ve kullanıcıya ait mi kontrol et
    board = db.query(models.Board).filter(models.Board.id == task_data.board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pano bulunamadı"
        )
    
    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu panoya görev ekleme yetkiniz yok"
        )
    
    # Yeni görev oluştur
    new_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        deadline=task_data.deadline,
        board_id=task_data.board_id,
        creator_id=current_user.id,
        position=0  # Yeni görevler en başa eklenir
    )
    
    # Etiketleri ekle (varsa)
    if task_data.label_ids:
        labels = db.query(models.Label).filter(
            models.Label.id.in_(task_data.label_ids),
            models.Label.board_id == task_data.board_id  # Etiketler aynı panoda olmalı
        ).all()
        new_task.labels = labels
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    board_id: Optional[int] = Query(None, description="Panoya göre filtrele"),
    status: Optional[str] = Query(None, regex="^(todo|in_progress|done)$", description="Duruma göre filtrele"),
    priority: Optional[str] = Query(None, regex="^(low|medium|high)$", description="Önceliğe göre filtrele"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Görevleri listeler
    - Sadece kullanıcının kendi panolarındaki görevler listelenir
    - Opsiyonel: board_id, status, priority parametreleri ile filtrelenebilir
    """
    # Temel sorgu: kullanıcının kendi panolarındaki görevler
    query = db.query(models.Task).join(models.Board).filter(
        models.Board.owner_id == current_user.id
    )
    
    # Filtreler
    if board_id:
        query = query.filter(models.Task.board_id == board_id)
    
    if status:
        query = query.filter(models.Task.status == status)
    
    if priority:
        query = query.filter(models.Task.priority == priority)
    
    # Sıralama: önce status'e göre (todo, in_progress, done), sonra position'a göre
    tasks = query.order_by(models.Task.status, models.Task.position).all()
    
    return tasks


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Belirli bir görevi getirir
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Görev bulunamadı"
        )
    
    # Görev kullanıcının panosuna ait mi?
    if task.board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu görevi görüntüleme yetkiniz yok"
        )
    
    return task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Görevi günceller
    - Sadece belirtilen alanlar güncellenir (partial update)
    - Durum, başlık, açıklama, öncelik, deadline, etiketler güncellenebilir
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Görev bulunamadı"
        )
    
    # Görev kullanıcının panosuna ait mi?
    if task.board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu görevi güncelleme yetkiniz yok"
        )
    
    # Sadece gönderilen alanları güncelle
    update_data = task_data.model_dump(exclude_unset=True)
    
    # Etiketleri güncelle (varsa)
    if "label_ids" in update_data:
        label_ids = update_data.pop("label_ids")
        if label_ids is not None:
            labels = db.query(models.Label).filter(
                models.Label.id.in_(label_ids),
                models.Label.board_id == task.board_id
            ).all()
            task.labels = labels
    
    # Diğer alanları güncelle
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Görevi siler
    - Görevle birlikte yorumları da silinir (cascade delete)
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Görev bulunamadı"
        )
    
    # Görev kullanıcının panosuna ait mi?
    if task.board.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu görevi silme yetkiniz yok"
        )
    
    db.delete(task)
    db.commit()
    
    return None  # 204 No Content
