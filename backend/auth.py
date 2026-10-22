"""
Kimlik doğrulama (authentication) ve yetkilendirme (authorization) fonksiyonları
JWT token oluşturma, şifre hash'leme, kullanıcı doğrulama işlemleri
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from config import settings
from database import get_db
import models

# Şifre hash'leme context'i - bcrypt algoritması kullanıyoruz
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 şeması - token'ı Authorization header'ından alır
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    """
    Düz metindeki şifreyi hash'ler (şifreler veritabanında asla düz metin olarak saklanmamalı!)
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kullanıcının girdiği şifreyi veritabanındaki hash ile karşılaştırır
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT access token oluşturur
    Token içinde kullanıcı bilgileri (payload) ve geçerlilik süresi bulunur
    """
    to_encode = data.copy()
    
    # Token'ın geçerlilik süresini ayarla
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Token'ı şifrele ve oluştur
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    JWT token'ı çözer ve içindeki payload'ı döner
    Token geçersizse hata fırlatır
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz veya süresi dolmuş",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Token'dan mevcut kullanıcıyı getirir
    Bu fonksiyon FastAPI'nin dependency injection sistemi ile kullanılır
    Korumalı endpoint'lerde kullanıcı doğrulaması için
    """
    # Token'ı çöz
    payload = decode_token(token)
    
    # Token'dan kullanıcı ID'sini al (string olarak gelir, integer'a çevir)
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token'da kullanıcı bilgisi bulunamadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token'daki kullanıcı ID'si geçersiz",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Veritabanından kullanıcıyı bul
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """
    Kullanıcı adı ve şifre ile kullanıcıyı doğrular
    Başarılı ise User nesnesini döner, başarısız ise None
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user
