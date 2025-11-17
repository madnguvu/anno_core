import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MemoryManagementPage from './pages/MemoryManagementPage';
import DBBrowserPage from './pages/DBBrowserPage';
import KeywordManagementPage from './pages/KeywordManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import TransportKeysPage from './pages/TransportKeysPage';
import TerminalPage from './pages/TerminalPage';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  active: boolean;
  org_id: string;
}

type AuthState = 'loading' | 'authenticated' | 'login' | 'register';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setAuthState('login');
      return;
    }

    try {
      // Verify token is still valid by making a test request
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAuthState('authenticated');
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setAuthState('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setAuthState('login');
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setAuthState('authenticated');
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setAuthState('authenticated');
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthState('login');
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Refresh dashboard stats when navigating to dashboard
    if (page === 'dashboard') {
      setDashboardRefreshTrigger(prev => prev + 1);
    }
  };

  const switchToRegister = () => {
    setAuthState('register');
  };

  const switchToLogin = () => {
    setAuthState('login');
  };

  if (authState === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '11pt', color: '#6c757d' }}>
            Loading Anno...
          </p>
        </div>
      </div>
    );
  }

  if (authState === 'login') {
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
  }

  if (authState === 'register') {
    return <RegisterPage onRegister={handleRegister} onSwitchToLogin={switchToLogin} />;
  }

  if (authState === 'authenticated' && user) {
    // Render appropriate page based on currentPage
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />;

      case 'memory-management':
        return <MemoryManagementPage user={user} onNavigate={handleNavigate} />;

      case 'db-browser':
        return user.role_id === 9 ? (
          <DBBrowserPage onNavigate={handleNavigate} />
        ) : (
          <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />
        );

      case 'keyword-management':
        return user.role_id === 9 ? (
          <KeywordManagementPage onNavigate={handleNavigate} />
        ) : (
          <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />
        );

      case 'user-management':
        return user.role_id === 9 ? (
          <UserManagementPage onNavigate={handleNavigate} />
        ) : (
          <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />
        );

      case 'transport-keys':
        return (
          <TransportKeysPage
            user={user}
            onNavigate={handleNavigate}
            isAdmin={user.role_id === 9}
          />
        );

      case 'terminal':
        return user.role_id === 9 ? (
          <TerminalPage onNavigate={handleNavigate} />
        ) : (
          <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />
        );

      default:
        return <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} refreshTrigger={dashboardRefreshTrigger} />;
    }
  }

  // Fallback
  return <LoginPage onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
};

export default App;
