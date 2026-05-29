import React from 'react';
import { colorFor, initials, fmtDate, fmtMoney } from '../utils/helpers';
import { useApi } from '../hooks/useApi';
import { useApiConfig } from '../context/ApiConfigContext';
import { apiGetStats } from '../services/apiService';
import { Button, StatusBadge, LoadingSpinner, ErrorBanner } from '../components/UI';
import styles from './DashboardPage.module.css';

const CHART_DATA   = [42, 58, 47, 72, 65, 81, 94];
const CHART_MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { completed: 'var(--blue)', shipped: 'var(--purple)', pending: 'var(--gold)' };

export default function DashboardPage({ navigate }) {
  const { apiUrl } = useApiConfig();
  const { data: stats, loading, error, refetch } = useApi(apiGetStats, [apiUrl]);
  const maxBar = Math.max(...CHART_DATA);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const {
    totalUsers    = 0,
    totalProducts = 0,
    totalOrders   = 0,
    revenue       = 0,
    ordersByStatus = {},
    recentOrders   = [],
  } = stats || {};

  const statCards = [
    { cls: 'blue',   icon: 'ti-users',          label: 'Total Users',  value: totalUsers },
    { cls: 'green',  icon: 'ti-package',        label: 'Products',     value: totalProducts },
    { cls: 'gold',   icon: 'ti-clipboard-list', label: 'Total Orders', value: totalOrders },
    { cls: 'purple', icon: 'ti-currency-dollar',label: 'Revenue',      value: fmtMoney(revenue) },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {statCards.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--' + s.cls + ')18', color: 'var(--' + s.cls + ')' }}>
              <i className={'ti ' + s.icon} />
            </div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.dashGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitle}>Order Volume</div>
            <span className={styles.cardSub}>Last 7 months</span>
          </div>
          <div className={styles.chartBars}>
            {CHART_DATA.map((v, i) => (
              <div key={i} className={styles.barWrap}>
                <div className={styles.bar} style={{
                  height: Math.round(v / maxBar * 100) + '%',
                  background: i === 6 ? 'linear-gradient(to top,#c9a84c,#e8c97a)' : 'var(--bg4)',
                  border: '1px solid ' + (i === 6 ? '#e8c97a40' : 'var(--border2)'),
                }} />
                <div className={styles.barLabel}>{CHART_MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}><div className={styles.cardTitle}>Order Status</div></div>
          {['completed', 'shipped', 'pending'].map(s => {
            const cnt = ordersByStatus[s] || 0;
            const pct = totalOrders ? Math.round(cnt / totalOrders * 100) : 0;
            return (
              <div key={s} className={styles.statusRow}>
                <div className={styles.statusRowHead}>
                  <span className={styles.statusLabel}>{s}</span>
                  <span className={styles.statusCount}>{cnt}</span>
                </div>
                <div className={styles.statusTrack}>
                  <div className={styles.statusBar} style={{ width: pct + '%', background: STATUS_COLORS[s] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardTitle}>Recent Orders</div>
          <Button variant="secondary" onClick={() => navigate('orders')} style={{ fontSize: 12, padding: '6px 12px' }}>
            View all <i className="ti ti-arrow-right" />
          </Button>
        </div>
        <div className={styles.recentList}>
          {recentOrders.length ? recentOrders.map(o => (
            <div key={o.id} className={styles.recentItem}>
              <div className={styles.recentAvatar} style={{ background: colorFor(o.id) + '22', color: colorFor(o.id) }}>
                {initials(o.productName || '?')}
              </div>
              <div className={styles.recentInfo}>
                <div className={styles.recentName}>{o.productName}</div>
                <div className={styles.recentSub}>{o.userName} · {fmtDate(o.createdAt)}</div>
              </div>
              <div className={styles.amount}>{fmtMoney(o.amount || 0)}</div>
              <StatusBadge status={o.status} />
            </div>
          )) : (
            <div className={styles.empty}>
              <i className="ti ti-clipboard-x" style={{ fontSize: 36, marginBottom: 8, color: 'var(--text3)' }} />
              <div>No orders yet</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
