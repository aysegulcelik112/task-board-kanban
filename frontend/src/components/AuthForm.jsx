/**
 * Giriş/Kayıt formu bileşeni
 * Tek bir bileşende hem giriş hem kayıt formu
 */
import { useState } from 'react';
import './AuthForm.css';

function AuthForm({ mode, onSubmit, error, onModeChange }) {
  const isLogin = mode === 'login';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>{isLogin ? '🔐 Giriş Yap' : '📝 Kayıt Ol'}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Görev takip panelinize giriş yapın'
            : 'Yeni hesap oluşturun'}
        </p>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder="kullaniciadi"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@email.com"
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Tam Ad (opsiyonel)</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Adınız Soyadınız"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? '⏳ İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>

        <div className="mode-switch">
          {isLogin ? (
            <p>
              Hesabınız yok mu?{' '}
              <button onClick={() => onModeChange('register')} className="link-button">
                Kayıt olun
              </button>
            </p>
          ) : (
            <p>
              Zaten hesabınız var mı?{' '}
              <button onClick={() => onModeChange('login')} className="link-button">
                Giriş yapın
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
