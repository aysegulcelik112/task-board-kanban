# 📖 TASK BOARD - KULLANIM KLAVUZU

## 🚀 Projeyi Çalıştırma

### Backend (Python/FastAPI):
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Frontend (React/Vite):
```bash
cd frontend
npm run dev
```

### Tarayıcıda Açma:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 👤 Kullanıcı İşlemleri

### 1. Kayıt Olma
1. Uygulama açıldığında "Kayıt Ol" formu görünür
2. Bilgilerinizi girin:
   - **Kullanıcı Adı**: Benzersiz olmalı
   - **E-posta**: Geçerli e-posta formatı
   - **Ad Soyad**: Tam adınız
   - **Şifre**: Güvenli şifre
3. "KAYIT OL" butonuna tıklayın
4. Başarılı olursa otomatik giriş ekranına yönlendirilirsiniz

### 2. Giriş Yapma
1. Kayıt olduktan sonra veya "Giriş yap" linkine tıklayarak
2. Bilgilerinizi girin:
   - **Kullanıcı Adı**
   - **Şifre**
3. "GİRİŞ YAP" butonuna tıklayın
4. Başarılı olursa ana panele yönlendirilirsiniz

### 3. Çıkış Yapma
1. Sağ üst köşedeki profil butonunuza tıklayın
2. Açılan menüden "🚪 Çıkış Yap" seçeneğine tıklayın
3. Giriş ekranına yönlendirilirsiniz

---

## 📋 Pano (Board) Yönetimi

### Yeni Pano Oluşturma
1. Ana panelde "➕ YENİ PANO" butonuna tıklayın
2. Modal açılır:
   - **Pano Adı**: Pano için isim (zorunlu)
   - **Açıklama**: Pano hakkında detay (opsiyonel)
3. "Oluştur" butonuna tıklayın
4. Yeni pano otomatik seçilir

### Pano Seçme
- Üstteki pano listesinden istediğiniz panoya tıklayın
- Aktif pano renkli gradient ile gösterilir

### Pano Silme
1. Panolar listesinde, pano üzerine gelin
2. "🗑️" (çöp kutusu) ikonuna tıklayın
3. Onay mesajını kabul edin
4. Pano ve tüm görevleri silinir

---

## ✅ Görev (Task) Yönetimi

### Yeni Görev Ekleme
1. İstediğiniz sütunda (Yapılacak/Devam Ediyor/Tamamlandı)
2. "➕ Görev Ekle" butonuna tıklayın
3. Görev bilgilerini girin:
   - **Başlık**: Görev adı (zorunlu)
   - **Açıklama**: Görev detayları (opsiyonel)
   - **Durum**: todo/in_progress/done (otomatik seçili)
   - **Öncelik**: low/medium/high (opsiyonel)
   - **Son Tarih**: Deadline (opsiyonel)
4. "Oluştur" butonuna tıklayın

### Görev Düzenleme
1. Görev kartına tıklayın
2. Modal açılır, bilgileri düzenleyin
3. "Güncelle" butonuna tıklayın

### Görev Silme
1. Görev kartı üzerine gelin
2. Sağ üstteki "🗑️" ikonuna tıklayın
3. Görev silinir (onay istemez)

### Görev Taşıma (Drag & Drop)
1. Bir görev kartını mouse ile tutun (tıkla-tut)
2. İstediğiniz sütuna sürükleyin
3. Bırakın
4. Görev durumu otomatik güncellenir

---

## 📊 İstatistikler

Ana panelde, pano bilgilerinin altında 5 kartlı istatistik paneli:

1. **📊 Toplam Görev**: Panodaki tüm görevler
2. **📋 Yapılacak**: Todo durumundaki görevler
3. **🔄 Devam Eden**: In Progress durumundaki görevler
4. **✅ Tamamlanan**: Done durumundaki görevler
5. **🎯 Tamamlanma**: Yüzde bar ile tamamlanma oranı

Her kart hover'da canlanır ve görsel geri bildirim verir.

---

## 🎨 UI Özellikleri

### Renkler ve Görsel Dil
- **Mavi (#667eea)**: Yapılacak görevler
- **Turuncu (#f39c12)**: Devam eden görevler
- **Yeşil (#2ecc71)**: Tamamlanan görevler
- **Gradient**: Mor-mavi-pembe kombinasyonu (butunlar, arkaplanlar)

### Animasyonlar
- **Hover efektleri**: Tüm kartlar ve butonlar
- **Gradient animasyonları**: Arka plan ve bordering
- **Slide animasyonları**: Modal açılışları
- **Smooth transitions**: Tüm etkileşimler

### Responsive Tasarım
- **Desktop**: 3 sütunlu layout
- **Tablet**: 2 sütunlu layout
- **Mobile**: 1 sütunlu layout, tam genişlik

---

## ⌨️ Klavye Kısayolları

- **Tab**: Elementler arası gezinme
- **Enter**: Form gönderme
- **Esc**: Modal kapatma
- **Space**: Buton tıklama

---

## 🔍 Önemli Notlar

### Görev Durumları
- **todo**: Henüz başlanmamış görevler (📋 Yapılacak)
- **in_progress**: Üzerinde çalışılan görevler (🔄 Devam Ediyor)
- **done**: Tamamlanmış görevler (✅ Tamamlandı)

### Öncelik Seviyeleri
- **low**: Düşük öncelik (yeşil badge)
- **medium**: Orta öncelik (turuncu badge)
- **high**: Yüksek öncelik (kırmızı badge)

### Deadline (Son Tarih)
- Normal tarih: Gri badge
- Geçmiş tarih: Kırmızı badge (OVERDUE)
- Tarihe göre otomatik sıralama yok

---

## 🐛 Sorun Giderme

### Backend Bağlantı Hatası
- Backend'in çalıştığından emin olun (port 8000)
- `http://localhost:8000/docs` adresini kontrol edin

### Frontend Açılmıyor
- Node modules kurulu mu? → `npm install`
- Port 5173 kullanımda değil mi?

### Görevler Yüklenmiyor
- Tarayıcı konsolunu açın (F12)
- Network sekmesinde hataları kontrol edin
- Token'ın localStorage'da olduğundan emin olun

### Drag & Drop Çalışmıyor
- Mouse ile click-hold yapın (mobile'de touch-hold)
- Görev kartını doğru sütuna sürükleyin
- Tarayıcı güncel mi kontrol edin

---

## 💡 İpuçları

### Verimli Kullanım
1. **Panolar**: Farklı projeler için ayrı panolar oluşturun
2. **Öncelikler**: Yüksek öncelikli görevleri belirleyin
3. **Son Tarihler**: Kritik görevlere deadline ekleyin
4. **Açıklamalar**: Detaylı açıklamalar ekleyin (markdown desteklemez ama çok satırlı olabilir)

### Görsel Düzen
- İstatistikleri takip edin (tamamlanma oranı)
- Sütunları dengeli tutun (çok fazla todo, az done ise sorun var)
- Renk kodlarını kullanın (kırmızı = acil, yeşil = tamamlandı)

### Performans
- Çok fazla görev varsa sayfayı yenileyin
- Tarayıcı cache'ini temizleyin (hard refresh: Ctrl+F5)
- Modern tarayıcı kullanın (Chrome, Firefox, Edge)

---

## 📞 Destek ve Geri Bildirim

Bu bir eğitim projesidir. Önerileriniz için:
1. `FEATURES.md` dosyasını okuyun
2. `UI_IMPROVEMENTS.md` dosyasına bakın
3. Kod içindeki yorumları inceleyin

---

## 🎓 Öğrenme Kaynakları

Bu proje ile öğrenilenler:
- React component yapısı
- State management (useState, useEffect)
- API entegrasyonu (axios)
- JWT authentication
- Drag & Drop (react-beautiful-dnd)
- Modern CSS (glassmorphism, gradients, animations)
- Responsive design
- FastAPI backend
- SQLAlchemy ORM
- RESTful API tasarımı

---

## 🎉 İyi Kullanımlar!

Projeyi kullanırken keyif alın! Tüm özellikler tamamen çalışır durumda. 

Sorularınız için:
- Backend API Docs: http://localhost:8000/docs
- Frontend Console: F12 > Console
- Network Tab: F12 > Network
