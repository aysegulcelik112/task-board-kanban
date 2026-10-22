"""
Veritabanı bağlantı ve session yönetimi
SQLAlchemy ile veritabanı işlemlerini yöneten temel dosya
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Veritabanı engine'ini oluştur - SQLite kullanıyoruz
# check_same_thread=False: FastAPI'nin async yapısı için gerekli
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite için gerekli
    echo=True  # SQL sorgularını konsola yazdır (debug için kullanışlı)
)

# Session oluşturucu - her istek için yeni bir database session açar
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class - tüm model sınıfları bundan türeyecek
Base = declarative_base()


def get_db():
    """
    Database session dependency
    FastAPI'nin dependency injection sistemi ile kullanılır
    Her istek için yeni bir db session açar ve istek bitince kapatır
    """
    db = SessionLocal()
    try:
        yield db  # İstek sırasında session'ı kullan
    finally:
        db.close()  # İstek bitince mutlaka kapat


def init_db():
    """
    Veritabanı tablolarını oluştur
    İlk çalıştırmada bu fonksiyon çağrılmalı
    """
    # Base'den türeyen tüm modellerin tablolarını oluştur
    Base.metadata.create_all(bind=engine)
    print("✅ Veritabanı tabloları oluşturuldu!")
