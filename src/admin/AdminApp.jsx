import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, BookOpen, Bot, ChevronRight,
  LayoutDashboard, LogOut, Menu, Settings, Shield, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminApp.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import AdminBorrows from './pages/AdminBorrows';
import AdminAI from './pages/AdminAI';
import AdminSettings from './pages/AdminSettings';

// ─── Toast System ─────────────────────────────────────────────────────────────

let _toastFn = null;
export function setToastFn(fn) { _toastFn = fn; }
export function showAdminToast(message, type = 'info') {
  if (_toastFn) _toastFn(message, type);
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastFn((message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    });
    return () => setToastFn(null);
  }, []);

  return (
    <div className="admin-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast ${t.type}`}>
          {t.type === 'success' && <span style={{ color: 'var(--admin-success)' }}>✓</span>}
          {t.type === 'error' && <span style={{ color: 'var(--admin-danger)' }}>✗</span>}
          {t.type === 'info' && <span style={{ color: 'var(--admin-secondary)' }}>ℹ</span>}
          <span className="admin-toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

const sidebarLinks = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Books', to: '/admin/books', icon: BookOpen },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Borrows', to: '/admin/borrows', icon: Activity },
  { label: 'AI Features', to: '/admin/ai', icon: Bot },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

function AdminSidebar({ open, onClose, user }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-mark">A</div>
          <div>
            <div className="admin-sidebar-logo-text">Admin Panel</div>
            <div className="admin-sidebar-logo-sub">HUMAM Digital Library</div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">
            <div className="admin-nav-section-label">Main Menu</div>
            {sidebarLinks.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-section-label">System</div>
            <NavLink to="/" className="admin-nav-item">
              <ChevronRight size={16} />
              Back to Site
            </NavLink>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="admin-sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'Admin'}
              </div>
              <div className="admin-sidebar-user-role">
                <Shield size={10} style={{ display: 'inline', marginRight: 3 }} />
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Admin Route Guard ────────────────────────────────────────────────────────

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0b0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', color: '#e2e4ef', flexDirection: 'column', gap: 16,
        padding: 24, textAlign: 'center',
      }}>
        <AlertTriangle size={48} color="#ef4444" />
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Access Denied</h2>
        <p style={{ color: '#8b90a7', fontSize: 14, margin: 0 }}>Your account does not have admin privileges.</p>
        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12, padding: '16px 20px', maxWidth: 360, fontSize: 13,
        }}>
          <p style={{ color: '#818cf8', fontWeight: 600, margin: '0 0 8px' }}>Admin Credentials:</p>
          <p style={{ color: '#8b90a7', margin: '0 0 4px' }}>Email: <strong style={{ color: '#e2e4ef' }}>prasad1@gmail.com</strong></p>
          <p style={{ color: '#8b90a7', margin: 0 }}>Password: <strong style={{ color: '#e2e4ef' }}>pr@sad123</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { navigate('/login'); }}
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: 10, padding: '10px 20px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Login as Admin
          </button>
          <NavLink to="/dashboard" style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '10px 20px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
            ← Go to Dashboard
          </NavLink>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// ─── Admin Shell ──────────────────────────────────────────────────────────────

function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentLink = sidebarLinks.find((l) =>
    l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
  );

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div className="admin-root">
      {/* Logout confirmation modal */}
      <div
        style={{
          display: showLogoutModal ? 'flex' : 'none',
          position: 'fixed', inset: 0, zIndex: 9999,
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={() => setShowLogoutModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#1a1b23', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20, padding: '36px 32px', maxWidth: 380, width: '90%',
            textAlign: 'center', boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
            animation: showLogoutModal ? 'logout-panel-in 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#ef4444',
          }}>
            <LogOut size={28} />
          </div>
          <h3 style={{ color: '#e2e4ef', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Sign Out?</h3>
          <p style={{ color: '#8b90a7', fontSize: 13, lineHeight: 1.6, margin: '0 0 24px' }}>
            You are about to sign out of the Admin Panel.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)',
                background: 'rgba(99,102,241,0.08)', color: '#8b90a7', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(99,102,241,0.15)'; e.target.style.color = '#e2e4ef'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(99,102,241,0.08)'; e.target.style.color = '#8b90a7'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(239,68,68,0.35)', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.35)'; e.currentTarget.style.transform = 'none'; }}
            >
              <LogOut size={14} /> Yes, Sign Out
            </button>
          </div>
        </div>
      </div>

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen((o) => !o)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="admin-header-title">{currentLink?.label || 'Admin'}</div>
              <div className="admin-header-subtitle">HUMAM Digital Library — Admin Panel</div>
            </div>
          </div>

          <div className="admin-header-actions">
            <NavLink to="/" className="admin-header-btn">
              <ChevronRight size={14} />
              View Site
            </NavLink>
            <button className="admin-header-btn" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

// ─── Admin App Root ───────────────────────────────────────────────────────────

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route element={<AdminShell />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="borrows" element={<AdminBorrows />} />
          <Route path="ai" element={<AdminAI />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
