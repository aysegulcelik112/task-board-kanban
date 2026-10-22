/**
 * Profil Sayfası - Kullanıcı bilgilerini düzenleme
 */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import './ProfilePage.css';

function ProfilePage({ onBack }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put('/auth/profile', {
        full_name: formData.full_name,
        email: formData.email
      });
      
      setMessage({ type: 'success', text: '✅ Profil güncellendi!' });
      
      // Sayfayı yenile
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '❌ ' + (error.response?.data?.detail || 'Güncelleme başarısız')
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Şifreler eşleşmiyor!' });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Şifre en az 6 karakter olmalı!' });
      setLoading(false);
      return;
    }

    try {
      await axios.put('/auth/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      
      setMessage({ type: 'success', text: '✅ Şifre değiştirildi!' });
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '❌ ' + (error.response?.data?.detail || 'Şifre değiştirilemedi')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            ← Geri
          </button>
          <h1>👤 Profil Ayarları</h1>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Kullanıcı Bilgileri */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </div>
          <h2>{user.username}</h2>
          <p className="user-id">ID: {user.id}</p>
        </div>

        {/* Profil Güncelleme Formu */}
        <div className="profile-card">
          <h3>📝 Bilgilerimi Güncelle</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Ad Soyad</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ad Soyad"
                required
              />
            </div>

            <div className="form-group">
              <label>E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-posta"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? '⏳ Güncelleniyor...' : '💾 Kaydet'}
            </button>
          </form>
        </div>

        {/* Şifre Değiştirme */}
        <div className="profile-card">
          <h3>🔒 Şifremi Değiştir</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Mevcut Şifre</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Mevcut şifreniz"
                required
              />
            </div>

            <div className="form-group">
              <label>Yeni Şifre</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Yeni şifre (min 6 karakter)"
                required
              />
            </div>

            <div className="form-group">
              <label>Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Yeni şifre tekrar"
                required
              />
            </div>

            <button type="submit" className="submit-button secondary" disabled={loading}>
              {loading ? '⏳ Değiştiriliyor...' : '🔐 Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
