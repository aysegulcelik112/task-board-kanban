/**
 * Ana uygulama bileşeni
 * Routing ve genel sayfa yapısı burada tanımlanacak
 */
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/AuthForm'
import KanbanBoard from './components/KanbanBoard'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import './App.css'

function AppContent() {
  const { user, loading, login, register, logout, isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'register'
  const [authError, setAuthError] = useState('');
  const [currentPage, setCurrentPage] = useState('board'); // 'board', 'profile', 'settings'
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Dark mode class'ını body'ye ekle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">⏳ Yükleniyor...</div>
      </div>
    );
  }

  const handleAuth = async (formData) => {
    setAuthError('');
    
    console.log('🔵 Auth işlemi başlıyor:', authMode, formData);
    
    let result;
    if (authMode === 'login') {
      result = await login(formData.username, formData.password);
    } else {
      result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName
      );
    }

    console.log('📊 Auth sonucu:', result);
    
    if (!result.success) {
      setAuthError(result.error);
    }
  };

  const handleModeChange = (newMode) => {
    setAuthMode(newMode);
    setAuthError('');
  };

  // Kullanıcı giriş yapmamışsa auth formunu göster
  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        error={authError}
        onModeChange={handleModeChange}
      />
    );
  }

  // Sayfa render'ı
  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => setCurrentPage('board')} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('board')} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  // Kullanıcı giriş yapmışsa Kanban Board'u göster
  return <KanbanBoard user={user} onLogout={logout} onNavigate={setCurrentPage} darkMode={darkMode} setDarkMode={setDarkMode} />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#fff',
            },
            style: {
              border: '2px solid #2ecc71',
            }
          },
          error: {
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
            style: {
              border: '2px solid #e74c3c',
            }
          }
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}

export default App
