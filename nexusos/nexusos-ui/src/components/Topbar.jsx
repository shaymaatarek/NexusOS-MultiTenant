import React from 'react';
import styles from './Topbar.module.css';

const PAGE_INFO = {
  dashboard: { title: 'Dashboard',  sub: 'Overview & analytics' },
  users:     { title: 'Users',      sub: 'Manage workspace members' },
  products:  { title: 'Products',   sub: 'Product catalog' },
  orders:    { title: 'Orders',     sub: 'Order management' },
};

export default function Topbar({ page, actions, theme, onToggleTheme, onOpenSettings }) {
  const info   = PAGE_INFO[page] || { title: page, sub: '' };
  const isDark = theme === 'dark';

  return (
    <div className={styles.topbar}>
      <div>
        <div className={styles.title}>{info.title}</div>
        <div className={styles.sub}>{info.sub}</div>
      </div>
      <div className={styles.actions}>
        {actions}
        {/* Theme toggle */}
        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <div className={`${styles.toggleTrack} ${isDark ? styles.trackDark : styles.trackLight}`}>
            <div className={`${styles.toggleThumb} ${isDark ? styles.thumbDark : styles.thumbLight}`}>
              {isDark ? <i className="ti ti-moon-stars" /> : <i className="ti ti-sun" />}
            </div>
          </div>
          <span className={styles.toggleLabel}>{isDark ? 'Dark' : 'Light'}</span>
        </button>
        {/* API Settings */}
        {/* <button className={styles.settingsBtn} onClick={onOpenSettings} title="API Settings">
          <i className="ti ti-settings" />
        </button> */}
      </div>
    </div>
  );
}
