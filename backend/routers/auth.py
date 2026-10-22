"""
Kimlik doğrulama endpoint'leri
Kullanıcı kayıt, giriş ve token yönetimi
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from auth import hash_password, authenticate_user, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı kaydı
    - Kullanıcı adı ve e-posta unique olmalı (tekrar edemez)
    - Şifre hash'lenerek saklanır (düz metin olarak asla saklanmaz!)
    """
    # Kullanıcı adı kontrolü - daha önce kullanılmış mı?
    existing_user = db.query(models.User).filter(
        (models.User.username == user_data.username) | 
        (models.User.email == user_data.email)
    ).first()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu kullanıcı adı zaten kullanılıyor"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi zaten kullanılıyor"
            )
    
    # Yeni kullanıcı oluştur
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),  # Şifreyi hash'le
        full_name=user_data.full_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # ID'yi almak için refresh
    
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Kullanıcı girişi
    - Kullanıcı adı ve şifre doğrulanır
    - Başarılı ise JWT access token döner
    """
    # Kullanıcıyı doğrula
    user = authenticate_user(db, user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # JWT token oluştur - token'ın içine kullanıcı ID'sini koy (string olarak)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Mevcut kullanıcının bilgilerini döner
    Token ile kimlik doğrulaması gerektirir
    """
    return current_user


@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcı profil bilgilerini günceller
    """
    # E-posta değişecekse, başka kullanıcıda kullanılıp kullanılmadığını kontrol et
    if profile_data.email and profile_data.email != current_user.email:
        existing_email = db.query(models.User).filter(
            models.User.email == profile_data.email,
            models.User.id != current_user.id
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi zaten kullanılıyor"
            )
        current_user.email = profile_data.email
    
    # Ad soyad güncelle
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.put("/change-password")
def change_password(
    password_data: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcı şifresini değiştirir
    """
    # Mevcut şifreyi doğrula
    user = authenticate_user(db, current_user.username, password_data.current_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifre hatalı"
        )
    
    # Yeni şifreyi hash'le ve güncelle
    current_user.hashed_password = hash_password(password_data.new_password)
    db.commit()
    
    return {"message": "Şifre başarıyla değiştirildi"}
