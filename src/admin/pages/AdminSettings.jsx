import { useEffect, useState } from 'react';
import { Activity, Clock, RefreshCw, Settings, Shield, Trash2 } from 'lucide-react';
import { adminGetActivityLogs } from '../../services/api-backend';
import { useAuth } from '../../context/AuthContext';
import { showAdminToast } from '../AdminApp';

const ACTION_META = {
  CREATE_BOOK:   { label: 'Book Added',      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  UPDATE_BOOK:   { label: 'Book Updated',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  DELETE_BOOK:   { label: 'Book Deleted',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  CREATE_USER:   { label: 'User Created',    color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  UPDATE_USER:   { label: 'User Updated',    color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  DELETE_USER:   { label: 'User Deleted',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ADMIN_RETURN:  { label: 'Return Override', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  async function load(pg = 1) {
    setLoading(true);
    const res = await adminGetActivityLogs({ page: pg, limit: LIMIT });
    if (res.success) { setLogs(res.logs); setTotal(res.total); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="admin-table-card">
      <div className="admin-table-toolbar">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>Activity Log</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{total} admin actions recorded</div>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => load(page)} disabled={loading}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon"><Activity size={28} /></div>
          <div className="admin-empty-title">No activity yet</div>
          <div className="admin-empty-text">Admin actions will appear here.</div>
        </div>
      ) : (
        <div className="admin-log-list">
          {logs.map((log) => {
            const meta = ACTION_META[log.action] || { label: log.action, color: '#8b90a7', bg: 'var(--admin-surface-2)' };
            return (
              <div key={log.id} className="admin-log-item">
                <div className="admin-log-icon" style={{ background: meta.bg, color: meta.color }}>
                  <Activity size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="admin-log-action">
                    <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                    {' · '}
                    <span>{log.target}</span>
                  </div>
                  <div className="admin-log-target">by {log.adminName}{log.details ? ` · ${log.details}` : ''}</div>
                </div>
                <div className="admin-log-time">
                  <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                  {timeAgo(log.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {Math.ceil(total / LIMIT) > 1 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">Page {page} of {Math.ceil(total / LIMIT)}</div>
          <div className="admin-pagination-btns">
            <button className="admin-pagination-btn" onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1}>← Prev</button>
            <button className="admin-pagination-btn" onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page === Math.ceil(total / LIMIT)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminProfile() {
  const { user } = useAuth();
  return (
    <div className="admin-chart-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Admin Account</div>
        <span className="admin-badge purple"><Shield size={9} />Super Admin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0,
          boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
        }}>
          {user?.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{user?.fullName}</div>
          <div style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 3 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: 'var(--admin-primary-light)', marginTop: 6 }}>
            <Shield size={10} style={{ display: 'inline', marginRight: 3 }} />
            Full system access
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Role', value: 'System Administrator' },
          { label: 'Access Level', value: 'Full (CRUD + AI + Audit)' },
          { label: 'College', value: user?.college || 'HUMAM Digital Library' },
          { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-text)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryInfo() {
  return (
    <div className="admin-chart-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Library Configuration</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Library Name', value: 'HUMAM Digital Library' },
          { label: 'Default Borrow Period', value: '14 days' },
          { label: 'Max Borrows per User', value: '3 books' },
          { label: 'Overdue Check', value: 'Auto on every admin request' },
          { label: 'AI Provider', value: 'Google Gemini 2.0 Flash' },
          { label: 'Database', value: 'MongoDB' },
          { label: 'Backend Port', value: '5000' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-text)' }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--admin-warning)', fontWeight: 600, marginBottom: 4 }}>⚠ AI Setup</div>
        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', lineHeight: 1.6 }}>
          Add <code style={{ background: 'var(--admin-surface-3)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>GEMINI_API_KEY=your_key</code> to your <strong>.env</strong> file to enable all AI features.
          Get a free key at <span style={{ color: 'var(--admin-primary-light)' }}>aistudio.google.com</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Settings & Audit</div>
          <div className="admin-section-subtitle">System configuration and admin activity logs</div>
        </div>
      </div>

      <div className="admin-two-col" style={{ marginBottom: 24 }}>
        <AdminProfile />
        <LibraryInfo />
      </div>

      <ActivityLogs />
    </div>
  );
}
