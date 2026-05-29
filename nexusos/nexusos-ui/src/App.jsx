import React, { useState } from 'react';
import './styles/globals.css';

import { ApiConfigProvider } from './context/ApiConfigContext';
import { useTenants }        from './hooks/useTenants';
import { useToast }          from './hooks/useToast';
import { useTheme }          from './hooks/useTheme';

import Sidebar           from './components/Sidebar';
import Topbar            from './components/Topbar';
import ApiSettingsPanel  from './components/ApiSettingsPanel';
import { Toast, LoadingSpinner } from './components/UI';

import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage     from './pages/UsersPage';
import ProductsPage  from './pages/ProductsPage';
import OrdersPage    from './pages/OrdersPage';

import styles from './App.module.css';

function AppShell() {
  const { currentTenant, currentUser, login, register, logout, isLoggedIn, hydrating } = useTenants();
  const { toast, showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [page,          setPage]          = useState('dashboard');
  const [authMode,      setAuthMode]      = useState('login');
  const [settingsOpen,  setSettingsOpen]  = useState(false);

  /* ── Hydrating (restoring session from token) ─────── */
  if (hydrating) {
    return (
      <div className={styles.app} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Restoring session…" />
      </div>
    );
  }

  /* ── Auth handlers ─────────────────────────────────── */
  const handleLogin = async (email, password) => {
    await login(email, password); // throws on failure — LoginPage catches it
    setPage('dashboard');
  };

  const handleRegister = async (formData) => {
    const user = await register(formData); // throws on failure
    showToast('Workspace created! Welcome, ' + user.name.split(' ')[0] + '!');
    setPage('dashboard');
  };

  /* ── Not logged in ─────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <div className={styles.app}>
        {authMode === 'login'
          ? <LoginPage    onLogin={handleLogin}       onSwitchToRegister={() => setAuthMode('register')} />
          : <RegisterPage onRegister={handleRegister} onSwitchToLogin={()    => setAuthMode('login')} />
        }
        {settingsOpen && <ApiSettingsPanel onClose={() => setSettingsOpen(false)} />}
        <Toast message={toast.msg} visible={toast.visible} />
        {/* Settings gear even on auth screen */}
        <button
          onClick={() => setSettingsOpen(true)}
          title="API Settings"
          style={{
            position:'fixed', bottom:24, right:24,
            background:'var(--bg2)', border:'1px solid var(--border2)',
            borderRadius:'50%', width:44, height:44,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'var(--text2)', fontSize:20,
            boxShadow:'var(--shadow2)', zIndex:50,
          }}
        >
          <i className="ti ti-settings" />
        </button>
      </div>
    );
  }

  /* ── Logged in ─────────────────────────────────────── */
  return (
    <div className={styles.app}>
      <Sidebar
        tenant={currentTenant || { company: '…', plan: '…', id: '' }}
        user={currentUser   || { name:    '…', role: '…', id: '' }}
        currentPage={page}
        onNavigate={setPage}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className={styles.main}>
        <Topbar
          page={page}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className={styles.content}>
          {page === 'dashboard' && <DashboardPage navigate={setPage} />}
          {page === 'users'     && <UsersPage     showToast={showToast} />}
          {page === 'products'  && <ProductsPage  showToast={showToast} />}
          {page === 'orders'    && <OrdersPage    showToast={showToast} />}
        </div>
      </div>

      {settingsOpen && <ApiSettingsPanel onClose={() => setSettingsOpen(false)} />}
      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}

export default function App() {
  return (
    <ApiConfigProvider>
      <AppShell />
    </ApiConfigProvider>
  );
}
