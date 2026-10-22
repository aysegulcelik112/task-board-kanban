"""
Uygulama yapılandırma ayarları
Veritabanı bağlantısı, JWT secret key gibi hassas bilgiler burada tutulur
"""
import os

class Settings:
    """
    Uygulama ayarlarını tutan sınıf
    Environment variable'lardan veya default değerlerden okur
    """
    # Veritabanı ayarları
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./taskboard.db")
    
    # JWT (JSON Web Token) ayarları
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-abc123xyz789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 gün
    
    # Proje bilgileri
    PROJECT_NAME: str = "Task Board"
    VERSION: str = "1.0.0"

# Global settings instance - uygulamada her yerden erişilebilir
settings = Settings()
