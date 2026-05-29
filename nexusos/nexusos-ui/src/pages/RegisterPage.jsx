import React, { useState } from 'react';
import { Logo, Button, FormRow, FormRow2 } from '../components/UI';
import styles from './AuthPage.module.css';
import { useApi, useMutation } from '../hooks/useApi';
import { useApiConfig } from '../context/ApiConfigContext';
import {apiGetPlans} from '../services/apiService';
// const PLANS = [
//   { key: 'starter',    name: 'Starter',    price: 'Free' },
//   { key: 'pro',        name: 'Pro',        price: '$29/mo' },
//   { key: 'enterprise', name: 'Enterprise', price: 'Custom' },
// ];

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  // let PLANS = [];
  const { apiUrl } = useApiConfig();
  const { data: PLANS = [], loading1, error1, refetch1, setData1 } = useApi(apiGetPlans, [apiUrl]);
  // PLANS = plansData
  const [form,    setForm]    = useState({ fname:'', lname:'', company:'', email:'', password:'', plan:'starter' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.fname || !form.lname || !form.company || !form.email || !form.password) {
      setError('Please fill all fields'); return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await onRegister(form);
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        <h1 className={styles.title}>Create workspace</h1>
        <p className={styles.sub}>Start your 14-day free trial, no card needed</p>
        <FormRow2>
          <div><label className={styles.inlineLabel}>First Name</label><input value={form.fname} onChange={e => set('fname', e.target.value)} placeholder="John" /></div>
          <div><label className={styles.inlineLabel}>Last Name</label><input value={form.lname} onChange={e => set('lname', e.target.value)} placeholder="Doe" /></div>
        </FormRow2>
        <FormRow label="Company Name"><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" /></FormRow>
        <FormRow label="Work Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" /></FormRow>
        <FormRow label="Password"><input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" /></FormRow>
        <label className={styles.planLabel}>Select Plan</label>
        <div className={styles.planGrid}>
          {PLANS && PLANS.length > 0 ? PLANS.map(p => (
            <div key={p.key} className={styles.planCard + (form.plan === p.key ? ' ' + styles.planActive : '')} onClick={() => set('plan', p.key)}>
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}</div>
            </div>
          )):""}
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <Button variant="gold" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating workspace…' : 'Create Workspace →'}
        </Button>
        <div className={styles.switchRow}>
          Already have an account?{' '}
          <span className={styles.link} onClick={onSwitchToLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
