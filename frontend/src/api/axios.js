/**
 * Axios yapılandırması
 * Backend API'ye yapılacak tüm istekler bu yapılandırmayı kullanır
 */
import axios from 'axios';

// Backend API'nin base URL'i
const API_BASE_URL = 'http://localhost:8000';

// Axios instance oluştur - tüm isteklerde ortak ayarları kullan
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - her istekte token ekle (varsa)
axiosInstance.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('token');
    if (token) {
      // Token varsa Authorization header'ına ekle
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hataları merkezi olarak yönet
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 hatası (Unauthorized) kontrolü
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      
      // Login ve register isteklerinde 401 hatası normaldir (yanlış şifre vs.)
      // Bu durumlarda kullanıcıyı yönlendirmeyelim, hatayı olduğu gibi fırlatalım
      const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                              requestUrl.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Diğer tüm endpoint'lerde 401 = token süresi dolmuş/geçersiz
        // Kullanıcıyı çıkış yaptır ve login sayfasına yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    
    // Tüm hataları console'a da yazdır (debug için)
    if (error.response) {
      console.error('❌ API Hatası:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    }
    
    // Hatayı yukarı fırlat - component'teki catch bloğu yakalasın
    return Promise.reject(error);
  }
);

export default axiosInstance;
