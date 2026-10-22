/**
 * Kimlik doğrulama context'i
 * Kullanıcı giriş durumunu tüm uygulama boyunca yönetir
 */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

// Custom hook - context'i kullanmak için
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook AuthProvider içinde kullanılmalı');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde token varsa kullanıcı bilgilerini al
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      });
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.access_token);
      
      // Kullanıcı bilgilerini al
      await fetchCurrentUser();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Giriş başarısız',
      };
    }
  };

  const register = async (username, email, password, fullName) => {
    try {
      console.log('🔵 Kayıt isteği gönderiliyor:', { username, email, full_name: fullName });
      
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
        full_name: fullName,
      });
      
      console.log('✅ Kayıt başarılı, otomatik giriş yapılıyor...');
      
      // Kayıt başarılı, otomatik giriş yap
      return await login(username, password);
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      console.error('❌ Hata detayı:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Kayıt başarısız',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
