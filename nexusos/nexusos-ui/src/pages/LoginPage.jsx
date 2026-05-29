import React, { useState } from 'react';
import { Logo, Button, FormRow } from '../components/UI';
import styles from './AuthPage.module.css';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bg} />
      <div className={styles.grid} />
      <div className={styles.card}>
        <Logo showBadge />
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your workspace</p>
        <FormRow label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@company.com" />
        </FormRow>
        <FormRow label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </FormRow>
        {error && <div className={styles.error}>{error}</div>}
        <Button variant="gold" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </Button>
        <div className={styles.switchRow}>
          Don't have an account?{' '}
          <span className={styles.link} onClick={onSwitchToRegister}>Create one</span>
        </div>
      </div>
    </div>
  );
}
