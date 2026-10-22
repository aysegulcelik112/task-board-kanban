/**
 * React uygulamasının giriş noktası
 * Burada React uygulaması DOM'a bağlanır
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config' // i18n konfigürasyonunu yükle

// React 18'in yeni createRoot API'sini kullanarak uygulamayı başlat
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
