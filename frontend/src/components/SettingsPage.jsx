/**
 * Ayarlar Sayfası - Uygulama ayarları
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsPage.css';

function SettingsPage({ onBack, darkMode, setDarkMode }) {
  const { t, i18n } = useTranslation();
  
  const [settings, setSettings] = useState({
    notifications: localStorage.getItem('notifications') !== 'false',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    soundEffects: localStorage.getItem('soundEffects') !== 'false',
    autoSave: localStorage.getItem('autoSave') !== 'false',
    language: i18n.language || 'tr'
  });

  const handleToggle = (setting) => {
    const newValue = !settings[setting];
    setSettings({
      ...settings,
      [setting]: newValue
    });
    localStorage.setItem(setting, newValue);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSettings({
      ...settings,
      language: newLang
    });
    // i18next'in dil değiştirme fonksiyonunu çağır
    i18n.changeLanguage(newLang);
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const clearCache = () => {
    if (confirm(t('settings.clearCacheConfirm'))) {
      // Önemli verileri sakla
      const token = localStorage.getItem('token');
      const darkModeValue = localStorage.getItem('darkMode');
      const languageValue = i18n.language;
      
      // Tümünü temizle
      localStorage.clear();
      
      // Önemli verileri geri yükle
      if (token) localStorage.setItem('token', token);
      if (darkModeValue) localStorage.setItem('darkMode', darkModeValue);
      if (languageValue) {
        localStorage.setItem('language', languageValue);
        i18n.changeLanguage(languageValue);
      }
      
      alert(t('settings.cacheCleared'));
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={onBack}>
            ← {t('common.back')}
          </button>
          <h1>⚙️ {t('settings.title')}</h1>
        </div>

        {/* Tema Ayarları */}
        <div className="settings-card">
          <h3>🎨 {t('settings.theme')}</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">{darkMode ? '🌙' : '☀️'}</div>
              <div>
                <div className="setting-label">{t('settings.darkMode')}</div>
                <div className="setting-description">
                  {darkMode ? t('settings.darkModeActive') : t('settings.lightModeActive')}
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="settings-card">
          <h3>🔔 {t('settings.notifications')}</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">🔔</div>
              <div>
                <div className="setting-label">{t('settings.appNotifications')}</div>
                <div className="setting-description">{t('settings.browserNotifications')}</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">📧</div>
              <div>
                <div className="setting-label">{t('settings.emailNotifications')}</div>
                <div className="setting-description">{t('settings.emailUpdates')}</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">🔊</div>
              <div>
                <div className="setting-label">{t('settings.soundEffects')}</div>
                <div className="setting-description">{t('settings.taskSounds')}</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={() => handleToggle('soundEffects')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Uygulama Ayarları */}
        <div className="settings-card">
          <h3>💾 {t('settings.application')}</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">💾</div>
              <div>
                <div className="setting-label">{t('settings.autoSave')}</div>
                <div className="setting-description">{t('settings.autoSaveDesc')}</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={() => handleToggle('autoSave')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">🌍</div>
              <div>
                <div className="setting-label">{t('settings.language')}</div>
                <div className="setting-description">{t('settings.languageDesc')}</div>
              </div>
            </div>
            <select 
              value={settings.language} 
              onChange={handleLanguageChange}
              className="language-select"
            >
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        {/* Veri Yönetimi */}
        <div className="settings-card">
          <h3>🗄️ {t('settings.dataManagement')}</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">🗑️</div>
              <div>
                <div className="setting-label">{t('settings.clearCache')}</div>
                <div className="setting-description">{t('settings.clearCacheDesc')}</div>
              </div>
            </div>
            <button className="action-button" onClick={clearCache}>
              {t('settings.clearButton')}
            </button>
          </div>
        </div>

        {/* Hakkında */}
        <div className="settings-card about-section">
          <h3>ℹ️ {t('settings.about')}</h3>
          <div className="about-info">
            <p><strong>Task Board</strong></p>
            <p>{t('settings.version')}</p>
            <p>© 2026 Task Board App</p>
            <p>{t('settings.project')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
