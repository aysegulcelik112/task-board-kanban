# 📚 Detaylı Kurulum ve Çalıştırma Kılavuzu

Bu dokümanda projeyi sıfırdan nasıl kuracağınızı ve çalıştıracağınızı adım adım anlatıyoruz.

---

## 🎯 Ön Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki yazılımların sisteminizde kurulu olduğundan emin olun:

- **Python 3.9 veya üzeri:** [python.org](https://www.python.org/downloads/)
- **Node.js 16 veya üzeri:** [nodejs.org](https://nodejs.org/)
- **Git:** [git-scm.com](https://git-scm.com/)

---

## 🚀 Kurulum

### 1. Projeyi İndirin

```bash
# Git ile klonlayın
git clone https://github.com/kullaniciadi/task-board.git
cd task-board

# VEYA ZIP olarak indirip çıkartın
```

### 2. Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Python virtual environment oluşturun
python -m venv venv

# Virtual environment'ı aktifleştirin
# Windows CMD:
venv\Scripts\activate.bat
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# .env dosyası oluşturun (opsiyonel, default değerler kullanılabilir)
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Backend'i başlatın
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend başarıyla çalışıyorsa: `http://localhost:8000/docs` adresinde Swagger UI'ı görebilirsiniz.

### 3. Frontend Kurulumu (Yeni Terminal)

```bash
# Frontend dizinine gidin
cd frontend

# Node modüllerini yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

✅ Frontend başarıyla çalışıyorsa: `http://localhost:5173` adresinde uygulamayı görebilirsiniz.

### 4. Uygulamayı Test Edin

1. Tarayıcıda `http://localhost:5173` adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. Kullanıcı bilgilerinizi girin ve kayıt olun
4. Otomatik olarak giriş yapılacak ve dashboard'a yönlendirileceksiniz
5. "Yeni Pano" butonuyla ilk panonuzu oluşturun
6. "Görev Ekle" butonuyla görev eklemeye başlayın!

---

## 🧪 Test Çalıştırma

### Backend Testleri

```bash
cd backend

# Virtual environment aktifse:
pytest

# Detaylı çıktı
pytest -v

# Coverage raporu
pytest --cov=backend --cov-report=html
# Rapor: htmlcov/index.html dosyasını tarayıcıda açın
```

---

## 🔧 Yaygın Sorunlar ve Çözümleri

### 1. Port Zaten Kullanılıyor

**Hata:** `Address already in use` veya `Port 8000 is already allocated`

**Çözüm:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :8000
kill -9 <pid>
```

### 2. Module Not Found

**Hata:** `ModuleNotFoundError: No module named 'fastapi'`

**Çözüm:**
```bash
# Virtual environment'ın aktif olduğundan emin olun
# Tekrar yükleyin
pip install -r requirements.txt
```

### 3. npm install Hatası

**Hata:** `npm ERR! code ENOENT`

**Çözüm:**
```bash
# npm cache'i temizleyin
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. CORS Hatası

**Hata:** `Access to XMLHttpRequest blocked by CORS policy`

**Çözüm:**
- Backend'in `http://localhost:8000` adresinde çalıştığından emin olun
- Frontend'in `http://localhost:5173` adresinde çalıştığından emin olun
- main.py'deki CORS ayarlarını kontrol edin

### 5. Database Locked (SQLite)

**Hata:** `database is locked`

**Çözüm:**
```bash
# Veritabanı dosyasını silin ve yeniden başlatın
rm taskboard.db
# Backend'i yeniden başlatın
```

---

## 📊 Veritabanı Yönetimi

Veritabanı dosyası: `backend/taskboard.db`

```bash
# Veritabanını sıfırla
rm backend/taskboard.db
# Backend'i başlat - otomatik oluşur
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite:///./taskboard.db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

## 📦 Production Deployment

### 1. Backend Hazırlama

```bash
# Gereksiz dosyaları temizle
rm -rf __pycache__ *.pyc test*.db

# Requirements freeze et
pip freeze > requirements.txt
```

### 2. Frontend Build

```bash
cd frontend
npm run build
# dist/ klasörü oluşur
```

### 3. Sunucu Ayarları

- **Backend:** Gunicorn veya uvicorn worker'ları ile
- **Frontend:** Nginx ile serve et
- **SSL:** Certbot ile Let's Encrypt

---

## 💡 Geliştirme İpuçları

### Hot Reload

- Backend: `uvicorn main:app --reload` ile otomatik yenilenir
- Frontend: Vite otomatik hot reload yapıyor

### Debug Mode

```bash
# Backend debug
uvicorn main:app --reload --log-level debug

# Frontend dev tools
# Tarayıcıda F12 ile console'u açın
```

### API Test

```bash
# Swagger UI kullanın
http://localhost:8000/docs

# VEYA curl ile
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

---

## 📖 Ek Kaynaklar

- [FastAPI Dokümantasyonu](https://fastapi.tiangolo.com/)
- [React Dokümantasyonu](https://react.dev/)
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Sorun mu yaşıyorsunuz?** Issue açın veya dokümantasyonu kontrol edin!
