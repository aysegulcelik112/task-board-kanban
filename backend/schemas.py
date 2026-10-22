"""
Pydantic şemaları - API request/response modelleri
Veri validasyonu (doğrulama) ve serileştirme için kullanılır
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ============= AUTH SCHEMAS =============

class UserRegister(BaseModel):
    """Kullanıcı kayıt isteği"""
    username: str = Field(..., min_length=3, max_length=50, description="Kullanıcı adı (3-50 karakter)")
    email: str = Field(..., description="E-posta adresi")
    password: str = Field(..., min_length=6, description="Şifre (minimum 6 karakter)")
    full_name: Optional[str] = Field(None, max_length=100, description="Tam ad (opsiyonel)")


class UserLogin(BaseModel):
    """Kullanıcı giriş isteği"""
    username: str = Field(..., description="Kullanıcı adı")
    password: str = Field(..., description="Şifre")


class UserProfileUpdate(BaseModel):
    """Profil güncelleme isteği"""
    full_name: Optional[str] = Field(None, max_length=100, description="Tam ad")
    email: Optional[str] = Field(None, description="E-posta adresi")


class PasswordChange(BaseModel):
    """Şifre değiştirme isteği"""
    current_password: str = Field(..., description="Mevcut şifre")
    new_password: str = Field(..., min_length=6, description="Yeni şifre (minimum 6 karakter)")


class Token(BaseModel):
    """JWT token yanıtı"""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Kullanıcı bilgisi yanıtı (şifre hariç!)"""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True  # SQLAlchemy modelinden dönüşüm için


# ============= BOARD SCHEMAS =============

class BoardCreate(BaseModel):
    """Pano oluşturma isteği"""
    title: str = Field(..., min_length=1, max_length=100, description="Pano başlığı")
    description: Optional[str] = Field(None, description="Pano açıklaması")


class BoardUpdate(BaseModel):
    """Pano güncelleme isteği"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class BoardResponse(BaseModel):
    """Pano yanıtı"""
    id: int
    title: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============= LABEL SCHEMAS =============

class LabelCreate(BaseModel):
    """Etiket oluşturma isteği"""
    name: str = Field(..., min_length=1, max_length=50, description="Etiket adı")
    color: str = Field(default="#808080", pattern="^#[0-9A-Fa-f]{6}$", description="Renk kodu (hex)")


class LabelResponse(BaseModel):
    """Etiket yanıtı"""
    id: int
    name: str
    color: str
    board_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= TASK SCHEMAS =============

class TaskCreate(BaseModel):
    """Görev oluşturma isteği"""
    title: str = Field(..., min_length=1, max_length=200, description="Görev başlığı")
    description: Optional[str] = Field(None, description="Görev açıklaması")
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$", description="Durum")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$", description="Öncelik")
    deadline: Optional[datetime] = Field(None, description="Son teslim tarihi")
    board_id: int = Field(..., description="Hangi panoya ait")
    label_ids: Optional[List[int]] = Field(default=[], description="Etiket ID'leri")


class TaskUpdate(BaseModel):
    """Görev güncelleme isteği"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|done)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    deadline: Optional[datetime] = None
    position: Optional[int] = None
    label_ids: Optional[List[int]] = None


class TaskResponse(BaseModel):
    """Görev yanıtı"""
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    deadline: Optional[datetime]
    board_id: int
    creator_id: int
    position: int
    created_at: datetime
    updated_at: Optional[datetime]
    labels: List[LabelResponse] = []
    
    class Config:
        from_attributes = True


# ============= COMMENT SCHEMAS =============

class CommentCreate(BaseModel):
    """Yorum oluşturma isteği"""
    content: str = Field(..., min_length=1, description="Yorum içeriği")
    task_id: int = Field(..., description="Hangi göreve ait")


class CommentResponse(BaseModel):
    """Yorum yanıtı"""
    id: int
    content: str
    task_id: int
    author_id: int
    author: UserResponse  # Yorum sahibinin bilgileri
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
