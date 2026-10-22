# Hata Çözümleri - Kayıt Sorunu

## Problem
Kullanıcı kayıt formunu doldurduğunda form temizleniyor ama hesap oluşturulmuyor. Giriş de aynı şekilde çalışmıyor.

## Kök Neden
**Frontend axios yapılandırması yanlış port numarasına işaret ediyordu:**
- Backend: `http://localhost:8000` üzerinde çalışıyor
- Frontend axios: `http://localhost:8001` üzerine istek gönderiyordu
- Sonuç: Tüm API istekleri başarısız oluyordu (network error)

## Çözüm

### 1. Port Numarasını Düzeltme
**Dosya:** `frontend/src/api/axios.js`

```javascript
// ÖNCE (YANLIŞ)
const API_BASE_URL = 'http://localhost:8001';

// SONRA (DOĞRU)
const API_BASE_URL = 'http://localhost:8000';
```

### 2. Form Geri Bildirimi İyileştirme
**Dosya:** `frontend/src/components/AuthForm.jsx`

- Loading state eklendi
- Form submit sırasında buton devre dışı bırakılıyor
- Kullanıcı "İşleniyor..." mesajı görüyor

```javascript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    await onSubmit(formData);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 3. Debug Logları Ekleme
**Dosya:** `frontend/src/App.jsx`

Console logları eklendi:
- Hangi auth işleminin yapıldığı (login/register)
- Gönderilen form verileri
- İşlem sonucu (başarılı/hatalı)

## Test Etme
1. Backend'in çalıştığından emin olun: `http://localhost:8000/docs`
2. Frontend'i yeniden başlatın (değişikliklerin yüklenmesi için)
3. Tarayıcı konsolunu açın (F12 -> Console)
4. Yeni bir hesap oluşturmayı deneyin
5. Console'da logları kontrol edin

## Beklenen Sonuç
✅ Kayıt formu gönderildiğinde:
- Console'da "🔵 Auth işlemi başlıyor" mesajı görünür
- Backend'e istek gönderilir
- Başarılı olursa otomatik giriş yapılır ve Kanban board açılır
- Hata varsa (kullanıcı adı zaten var vs.) form üzerinde hata mesajı görünür

## Notlar
- Axios timeout 10 saniye olarak ayarlandı
- 401 (Unauthorized) hataları login/register endpoint'lerinde normal
- Diğer endpoint'lerde 401 hatası alınırsa otomatik logout yapılır
