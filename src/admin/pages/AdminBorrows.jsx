import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, BookOpen, CheckCircle, RefreshCw, Search, X } from 'lucide-react';
import { adminGetBorrowRecords, adminReturnBook } from '../../services/api-backend';
import { showAdminToast } from '../AdminApp';

export default function AdminBorrows() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState(null);
  const LIMIT = 20;

  async function load(pg = 1, st = status, q = search) {
    setLoading(true);
    const params = { page: pg, limit: LIMIT };
    if (st) params.status = st;
    if (q) params.search = q;
    const res = await adminGetBorrowRecords(params);
    if (res.success) { setRecords(res.records); setTotal(res.total); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleStatusChange = (s) => { setStatus(s); setPage(1); load(1, s, search); };
  const handleSearch = (q) => { setSearch(q); setPage(1); load(1, status, q); };

  const handleReturn = async (record) => {
    setReturning(record.id);
    const res = await adminReturnBook(record.id);
    setReturning(null);
    if (res.success) {
      showAdminToast('Book marked as returned', 'success');
      setRecords((prev) => prev.map((r) => r.id === record.id ? { ...r, status: 'Returned', returnDate: new Date().toISOString() } : r));
    } else {
      showAdminToast(res.message || 'Failed to return', 'error');
    }
  };

  const statusBadge = (s) => {
    if (s === 'Borrowed') return <span className="admin-badge warning"><Activity size={9} />{s}</span>;
    if (s === 'Returned') return <span className="admin-badge success"><CheckCircle size={9} />{s}</span>;
    return <span className="admin-badge danger"><AlertTriangle size={9} />{s}</span>;
  };

  const isOverdue = (record) => record.status !== 'Returned' && new Date(record.dueDate) < new Date();
  const totalPages = Math.ceil(total / LIMIT);

  const counts = { all: total };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Borrow Records</div>
          <div className="admin-section-subtitle">{total} total records</div>
        </div>
        <button className="admin-btn admin-btn-secondary" onClick={() => load(page)} disabled={loading}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'All', value: '', color: 'var(--admin-primary-light)' },
          { label: 'Borrowed', value: 'Borrowed', color: 'var(--admin-warning)' },
          { label: 'Returned', value: 'Returned', color: 'var(--admin-success)' },
          { label: 'Overdue', value: 'Overdue', color: 'var(--admin-danger)' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: status === tab.value ? 'rgba(99,102,241,0.15)' : 'var(--admin-surface)',
              border: status === tab.value ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--admin-border)',
              color: status === tab.value ? 'var(--admin-primary-light)' : 'var(--admin-text-muted)',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar-left">
            <div className="admin-search">
              <Search size={14} color="var(--admin-text-dim)" />
              <input
                placeholder="Search user or book..."
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
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{records.length} shown</span>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : records.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><BookOpen size={28} /></div>
              <div className="admin-empty-title">No records found</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Status</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Returned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={isOverdue(r) ? { background: 'rgba(239,68,68,0.03)' } : {}}>
                    <td>
                      <div className="admin-avatar-cell">
                        <div className="admin-avatar-sm">{r.user?.fullName?.charAt(0)?.toUpperCase() || '?'}</div>
                        <div>
                          <div className="admin-cell-primary">{r.user?.fullName || 'Unknown'}</div>
                          <div className="admin-cell-secondary">{r.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-primary" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.book?.title || 'Unknown'}
                      </div>
                      <div className="admin-cell-secondary">{r.book?.category}</div>
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>
                      {new Date(r.borrowDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: isOverdue(r) ? 'var(--admin-danger)' : 'var(--admin-text-muted)', fontWeight: isOverdue(r) ? 600 : 400 }}>
                        {isOverdue(r) && '⚠ '}
                        {new Date(r.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>
                      {r.returnDate ? new Date(r.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      {r.status !== 'Returned' && (
                        <button
                          className="admin-btn admin-btn-success admin-btn-sm"
                          onClick={() => handleReturn(r)}
                          disabled={returning === r.id}
                        >
                          <CheckCircle size={12} />
                          {returning === r.id ? 'Processing...' : 'Mark Returned'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <div className="admin-pagination-info">Page {page} of {totalPages}</div>
            <div className="admin-pagination-btns">
              <button className="admin-pagination-btn" onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1}>← Prev</button>
              <button className="admin-pagination-btn" onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
