import { useEffect, useState } from 'react';
import { Edit2, Mail, Plus, Search, Shield, ShieldOff, Trash2, User, X } from 'lucide-react';
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../services/api-backend';
import { showAdminToast } from '../AdminApp';

const EMPTY_FORM = { fullName: '', email: '', password: '', mobile: '', gender: 'Female', college: '', course: '', academicYear: '', isAdmin: false };

function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 380 }}>
        <div className="admin-modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div className="admin-confirm-icon"><Trash2 size={24} /></div>
          <div className="admin-confirm-title">{title}</div>
          <div className="admin-confirm-text">{message}</div>
        </div>
        <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState(user ? { ...user, password: '' } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    const res = user
      ? await adminUpdateUser(user.id, payload)
      : await adminCreateUser(payload);
    setLoading(false);
    if (res.success) {
      showAdminToast(user ? 'User updated!' : 'User created!', 'success');
      onSaved(res.user);
    } else {
      showAdminToast(res.message || 'Failed to save user', 'error');
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal admin-modal-lg">
        <div className="admin-modal-header">
          <div className="admin-modal-title">{user ? 'Edit User' : 'Create New User'}</div>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input className="admin-form-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required placeholder="John Doe" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email *</label>
                <input className="admin-form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="user@example.com" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input className="admin-form-input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required={!user} placeholder="••••••" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mobile</label>
                <input className="admin-form-input" value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} placeholder="+91..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Gender</label>
                <select className="admin-form-select" value={form.gender || 'Female'} onChange={(e) => set('gender', e.target.value)}>
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">College</label>
                <input className="admin-form-input" value={form.college || ''} onChange={(e) => set('college', e.target.value)} placeholder="College name" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Course</label>
                <input className="admin-form-input" value={form.course || ''} onChange={(e) => set('course', e.target.value)} placeholder="B.Tech, MCA..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Academic Year</label>
                <input className="admin-form-input" value={form.academicYear || ''} onChange={(e) => set('academicYear', e.target.value)} placeholder="1st, 2nd..." />
              </div>
              <div className="admin-form-group full">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={form.isAdmin || false} onChange={(e) => set('isAdmin', e.target.checked)} style={{ width: 16, height: 16 }} />
                  Grant Admin Privileges
                  <span style={{ fontSize: 11, color: 'var(--admin-warning)' }}>⚠ This gives full admin access</span>
                </label>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);
  const LIMIT = 15;

  async function loadUsers(pg = page, q = search) {
    setLoading(true);
    const res = await adminGetUsers({ page: pg, limit: LIMIT, search: q });
    if (res.success) { setUsers(res.users); setTotal(res.total); }
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, [page]);

  const handleSearch = (q) => {
    setSearch(q);
    setPage(1);
    loadUsers(1, q);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await adminDeleteUser(deleteTarget.id);
    setDeleting(false);
    if (res.success) {
      showAdminToast('User deleted', 'success');
      setDeleteTarget(null);
      loadUsers();
    } else {
      showAdminToast(res.message || 'Failed to delete', 'error');
    }
  };

  const handleToggleAdmin = async (user) => {
    setToggling(user.id);
    const res = await adminUpdateUser(user.id, { isAdmin: !user.isAdmin });
    setToggling(null);
    if (res.success) {
      showAdminToast(`${user.fullName} ${res.user.isAdmin ? 'is now admin' : 'is no longer admin'}`, 'success');
      setUsers((prev) => prev.map((u) => (u.id === res.user.id ? { ...u, ...res.user } : u)));
    } else {
      showAdminToast(res.message || 'Failed', 'error');
    }
  };

  const handleSaved = (savedUser) => {
    setModal(null);
    loadUsers();
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">User Management</div>
          <div className="admin-section-subtitle">{total} registered users</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setModal('new')}>
          <Plus size={14} /> Add User
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar-left">
            <div className="admin-search">
              <Search size={14} color="var(--admin-text-dim)" />
              <input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)', display: 'flex' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{total} total</span>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><User size={28} /></div>
              <div className="admin-empty-title">No users found</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>College</th>
                  <th>Course</th>
                  <th>Borrows</th>
                  <th>Active</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-avatar-cell">
                        <div className="admin-avatar-sm">{u.fullName?.charAt(0)?.toUpperCase()}</div>
                        <div>
                          <div className="admin-cell-primary">{u.fullName}</div>
                          <div className="admin-cell-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={10} />{u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.isAdmin
                        ? <span className="admin-badge purple"><Shield size={9} />Admin</span>
                        : <span className="admin-badge info"><User size={9} />Student</span>}
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{u.college || '—'}</td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{u.course || '—'}</td>
                    <td><span style={{ fontWeight: 600, color: 'var(--admin-primary-light)' }}>{u.borrowCount || 0}</span></td>
                    <td>
                      {(u.activeCount || 0) > 0
                        ? <span className="admin-badge warning">{u.activeCount}</span>
                        : <span style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="admin-action-group">
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setModal(u)} title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button
                          className={`admin-btn admin-btn-sm ${u.isAdmin ? 'admin-btn-warning' : 'admin-btn-secondary'}`}
                          onClick={() => handleToggleAdmin(u)}
                          disabled={toggling === u.id}
                          title={u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                          style={u.isAdmin ? { background: 'rgba(168,85,247,0.1)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.2)' } : {}}
                        >
                          {toggling === u.id ? '...' : u.isAdmin ? <ShieldOff size={13} /> : <Shield size={13} />}
                        </button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(u)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Page {page} of {totalPages} ({total} users)
            </div>
            <div className="admin-pagination-btns">
              <button className="admin-pagination-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`admin-pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="admin-pagination-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <UserModal
          user={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Delete "${deleteTarget.fullName}"? All their borrow records, favorites, and notifications will also be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
