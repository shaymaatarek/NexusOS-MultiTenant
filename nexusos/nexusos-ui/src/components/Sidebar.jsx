import React from 'react';
import { colorFor, initials } from '../utils/helpers';
import { Button } from './UI';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { page: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', countKey: null },
  { page: 'users',     icon: 'ti-users',            label: 'Users',     countKey: 'users' },
  { page: 'products',  icon: 'ti-package',          label: 'Products',  countKey: 'products' },
  { page: 'orders',    icon: 'ti-clipboard-list',   label: 'Orders',    countKey: 'orders' },
];

export default function Sidebar({ tenant, user, currentPage, onNavigate, onLogout }) {
  return (
    <aside className={styles.sidebar}>

      {/* Logo */}
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>N</div>
        <div className={styles.logoText}>NexusOS</div>
      </div>

      {/* Tenant */}
      <div className={styles.tenantRow}>
        <div className={styles.tenantAvatar} style={{ background: colorFor(tenant.id), color: '#0d0f14' }}>
          {initials(tenant.company)}
        </div>
        <div>
          <div className={styles.tenantName}>{tenant.company}</div>
          <div className={styles.tenantPlan}>{tenant.plan} plan</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>Main</div>
        {NAV_ITEMS.slice(0, 1).map(item => (
          <NavItem key={item.page} item={item} tenant={tenant} active={currentPage === item.page} onNavigate={onNavigate} />
        ))}
        <div className={styles.navSection}>Manage</div>
        {NAV_ITEMS.slice(1).map(item => (
          <NavItem key={item.page} item={item} tenant={tenant} active={currentPage === item.page} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Footer / User */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.userAvatar} style={{ background: colorFor(user.id) }}>
            {initials(user.name)}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.role}</div>
          </div>
          <Button variant="logout" onClick={onLogout} title="Logout">
            <i className="ti ti-logout" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, tenant, active, onNavigate }) {
  const count = item.countKey ? tenant[item.countKey]?.length : null;
  return (
    <div className={`${styles.navItem} ${active ? styles.active : ''}`} onClick={() => onNavigate(item.page)}>
      <i className={`ti ${item.icon}`} />
      {item.label}
      {count !== null && <span className={styles.badge}>{count}</span>}
    </div>
  );
}
