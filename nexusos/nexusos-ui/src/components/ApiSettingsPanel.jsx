import React, { useState } from 'react';
import { useApiConfig } from '../context/ApiConfigContext';
import { Modal, Button, FormRow } from './UI';
import styles from './ApiSettingsPanel.module.css';

export default function ApiSettingsPanel({ onClose }) {
  const { apiUrl, updateApiUrl, resetUrl, defaultUrl } = useApiConfig();
  const [value,   setValue]   = useState(apiUrl);
  const [saved,   setSaved]   = useState(false);
  const [testMsg, setTestMsg] = useState(null); // null | { ok, text }
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;
    updateApiUrl(value.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const def = resetUrl();
    setValue(def);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMsg(null);
    const base = value.trim().replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setTestMsg({ ok: res.ok, text: res.ok ? `✓ Reachable (HTTP ${res.status})` : `✗ HTTP ${res.status}` });
    } catch (err) {
      setTestMsg({ ok: false, text: `✗ ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      title="API Configuration"
      onClose={onClose}
      actions={
        <>
          <Button variant="cancel" onClick={onClose}>Close</Button>
          <Button variant="save"   onClick={handleSave}>{saved ? '✓ Saved!' : 'Save'}</Button>
        </>
      }
    >
      <p className={styles.hint}>
        Set the base URL of your backend API. All requests will be sent to this origin.
        Changes take effect immediately without a page reload.
      </p>

      <FormRow label="API Base URL">
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setSaved(false); setTestMsg(null); }}
          placeholder="https://api.example.com/v1"
          spellCheck={false}
          autoComplete="off"
        />
      </FormRow>

      <div className={styles.row}>
        <Button variant="secondary" onClick={handleTest} disabled={testing} style={{ flex: 1 }}>
          <i className={`ti ${testing ? 'ti-loader-2' : 'ti-wifi'}`} style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }} />
          {testing ? 'Testing…' : 'Test Connection'}
        </Button>
        <Button variant="secondary" onClick={handleReset} style={{ flex: 1 }}>
          <i className="ti ti-refresh" /> Reset to Default
        </Button>
      </div>

      {testMsg && (
        <div className={`${styles.testResult} ${testMsg.ok ? styles.ok : styles.fail}`}>
          {testMsg.text}
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Expected API Contract</div>
        <div className={styles.endpointList}>
          {[
            ['POST', '/auth/login',      '{ email, password } → { token, user, tenant }'],
            ['POST', '/auth/register',   '{ name, company, email, password, plan } → { token, user, tenant }'],
            ['GET',  '/auth/me',         'Bearer token → { user, tenant }'],
            ['GET',  '/dashboard/stats', 'Bearer token → { totalUsers, totalProducts, totalOrders, revenue, ordersByStatus, recentOrders }'],
            ['GET',  '/users',           'Bearer token → [ ...users ]'],
            ['POST', '/users',           '{ name, email, role, status } → user'],
            ['PUT',  '/users/:id',       'Partial user → updated user'],
            ['DEL',  '/users/:id',       '204 No Content'],
            ['GET',  '/products',        'Bearer token → [ ...products ]'],
            ['POST', '/products',        '{ name, category, price, stock, status } → product'],
            ['PUT',  '/products/:id',    'Partial product → updated product'],
            ['DEL',  '/products/:id',    '204 No Content'],
            ['GET',  '/orders',          'Bearer token → [ ...orders ]'],
            ['POST', '/orders',          '{ productId, userId, qty, status } → order'],
            ['PATCH','/orders/:id',      '{ status } → updated order'],
            ['DEL',  '/orders/:id',      '204 No Content'],
          ].map(([method, path, desc]) => (
            <div key={path + method} className={styles.endpoint}>
              <span className={`${styles.method} ${styles['m_' + method.toLowerCase()]}`}>{method}</span>
              <span className={styles.path}>{path}</span>
              <span className={styles.desc}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Environment Variable</div>
        <code className={styles.envHint}>VITE_API_BASE_URL=https://your-api.com/v1</code>
        <p className={styles.envNote}>Set in <code>.env</code> before building to bake in the URL at build time. Runtime settings (above) always take priority.</p>
      </div>
    </Modal>
  );
}
