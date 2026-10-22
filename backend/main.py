"""
Görev ve Proje Takip Paneli - Ana Backend Dosyası
Bu dosya FastAPI uygulamasının giriş noktasıdır.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, tasks, boards, board_stats, labels, comments

# FastAPI uygulamasını oluştur
app = FastAPI(
    title="Task Board API",
    description="Kanban tarzı görev takip paneli için REST API",
    version="1.0.0"
)

# CORS ayarları - Frontend'in backend'e erişebilmesi için gerekli
# NOT: CORS middleware router'lardan ÖNCE eklenmelidir!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(tasks.router)
app.include_router(board_stats.router)
app.include_router(labels.router)
app.include_router(comments.router)

# Uygulama başladığında veritabanını oluştur
@app.on_event("startup")
async def startup_event():
    """Uygulama başlatıldığında çalışır - veritabanı tablolarını oluşturur"""
    print("🚀 Uygulama başlatılıyor...")
    init_db()
    print("✅ Veritabanı hazır!")

@app.get("/")
def read_root():
    """API'nin çalıştığını kontrol etmek için basit bir endpoint"""
    return {
        "message": "Task Board API'ye hoş geldiniz!",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/test-cors")
def test_cors():
    """CORS test endpoint'i"""
    return {"message": "CORS çalışıyor!", "success": True}

@app.get("/health")
def health_check():
    """Sağlık kontrolü endpoint'i - sunucunun çalışır durumda olup olmadığını kontrol eder"""
    return {"status": "healthy"}

# Uygulama çalıştırma komutu (geliştirme için):
# uvicorn main:app --reload --port 8000
