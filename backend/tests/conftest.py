"""
Pytest configuration
Ortak test fixture'ları ve ayarlar - tüm testler için izole veritabanı
"""
import pytest
import sys
from pathlib import Path

# Backend dizinini Python path'e ekle
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from database import Base, get_db


@pytest.fixture(scope="function")
def test_db():
    """
    Her test için izole in-memory SQLite veritabanı oluşturur
    Test bittiğinde veritabanı otomatik olarak temizlenir
    """
    # In-memory SQLite + StaticPool: her test için temiz ve izole bir DB
    engine = create_engine(
        "sqlite://",  # In-memory database
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # Aynı connection'ı kullan (in-memory için gerekli)
    )
    
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Tabloları oluştur
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        """Test veritabanı session'ı"""
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    # Dependency override'ı ayarla
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestSessionLocal
    
    # Cleanup: tabloları düşür ve override'ı temizle
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(test_db):
    """
    Test client fixture'ı - test_db fixture'ına bağımlı
    Her test için temiz bir veritabanı ile TestClient döner
    """
    return TestClient(app)
