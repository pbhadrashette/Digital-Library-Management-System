import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Edit2, Plus, Search, Sparkles, Tag, Trash2, X } from 'lucide-react';
import {
  adminCreateBook, adminDeleteBook, adminUpdateBook,
  adminAIGenerateDescription, adminAIRecommendCategory, getBooks,
} from '../../services/api-backend';
import { showAdminToast } from '../AdminApp';

const CATEGORIES = [
  'Programming','Python','AI','ML','Frontend','Databases','CS Fundamentals',
  'Cloud','Security','DevOps','Mobile','Networking','Engineering','Data Science','Emerging Tech',
];

const EMPTY_FORM = { title: '', author: '', category: '', description: '', pages: '', year: new Date().getFullYear(), isbn: '', cover: '', rating: '4.5', availability: 'Available' };

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 380 }}>
        <div className="admin-modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div className="admin-confirm-icon"><Trash2 size={24} /></div>
          <div className="admin-confirm-title">Confirm Delete</div>
          <div className="admin-confirm-text">{message}</div>
        </div>
        <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Book Form Modal ──────────────────────────────────────────────────────────
function BookModal({ book, onClose, onSaved }) {
  const [form, setForm] = useState(book ? { ...book, pages: String(book.pages || ''), year: String(book.year || ''), rating: String(book.rating || '4.5') } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiCatLoading, setAiCatLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAIDescription = async () => {
    if (!form.title) return showAdminToast('Enter a title first', 'error');
    setAiDescLoading(true);
    const res = await adminAIGenerateDescription({ title: form.title, author: form.author, category: form.category, pages: form.pages, year: form.year });
    setAiDescLoading(false);
    if (res.success) {
      set('description', res.description);
      showAdminToast('AI description generated!', 'success');
    } else {
      showAdminToast(res.message || 'AI unavailable', 'error');
    }
  };

  const handleAICategory = async () => {
    if (!form.title) return showAdminToast('Enter a title first', 'error');
    setAiCatLoading(true);
    const res = await adminAIRecommendCategory({ title: form.title, author: form.author, description: form.description });
    setAiCatLoading(false);
    if (res.success) {
      set('category', res.category);
      showAdminToast(`AI suggests: ${res.category}`, 'success');
    } else {
      showAdminToast(res.message || 'AI unavailable', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, pages: Number(form.pages) || 0, year: Number(form.year) || 2024, rating: Number(form.rating) || 4.5 };
    const res = book
      ? await adminUpdateBook(book.id, payload)
      : await adminCreateBook(payload);
    setLoading(false);
    if (res.success) {
      showAdminToast(book ? 'Book updated!' : 'Book created!', 'success');
      onSaved(res.book);
    } else {
      showAdminToast(res.message || 'Failed to save book', 'error');
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal admin-modal-lg">
        <div className="admin-modal-header">
          <div className="admin-modal-title">{book ? 'Edit Book' : 'Add New Book'}</div>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Title *</label>
                <input className="admin-form-input" value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="Book title" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Author *</label>
                <input className="admin-form-input" value={form.author} onChange={(e) => set('author', e.target.value)} required placeholder="Author name" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Category *
                  <button type="button" className="admin-ai-btn" onClick={handleAICategory} disabled={aiCatLoading}>
                    <Sparkles size={10} />{aiCatLoading ? 'AI...' : 'AI Suggest'}
                  </button>
                </label>
                <select className="admin-form-select" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Availability</label>
                <select className="admin-form-select" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
                  <option>Available</option><option>Borrowed</option><option>Reserved</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Pages</label>
                <input className="admin-form-input" type="number" value={form.pages} onChange={(e) => set('pages', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Year</label>
                <input className="admin-form-input" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2024" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">ISBN</label>
                <input className="admin-form-input" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} placeholder="978-..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Rating (1–5)</label>
                <input className="admin-form-input" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
              </div>
              <div className="admin-form-group full">
                <label className="admin-form-label">Cover Image URL</label>
                <input className="admin-form-input" value={form.cover} onChange={(e) => set('cover', e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-group full">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Description
                  <button type="button" className="admin-ai-btn" onClick={handleAIDescription} disabled={aiDescLoading}>
                    <Sparkles size={10} />{aiDescLoading ? 'Generating...' : 'AI Generate'}
                  </button>
                </label>
                <textarea className="admin-form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Book description..." rows={4} />
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : book ? 'Update Book' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Books Page ─────────────────────────────────────────────────────────
export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterAvail, setFilterAvail] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | bookObj
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadBooks() {
    setLoading(true);
    const res = await getBooks();
    if (res.success) setBooks(res.books);
    setLoading(false);
  }

  useEffect(() => { loadBooks(); }, []);

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q);
    const matchCat = !filterCat || b.category === filterCat;
    const matchAvail = !filterAvail || b.availability === filterAvail;
    return matchQ && matchCat && matchAvail;
  });

  const handleDelete = async () => {
    setDeleting(true);
    const res = await adminDeleteBook(deleteTarget.id);
    setDeleting(false);
    if (res.success) {
      showAdminToast('Book deleted', 'success');
      setBooks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      showAdminToast(res.message || 'Failed to delete', 'error');
    }
  };

  const handleSaved = (savedBook) => {
    if (modal === 'add') {
      setBooks((prev) => [savedBook, ...prev]);
    } else {
      setBooks((prev) => prev.map((b) => (b.id === savedBook.id ? savedBook : b)));
    }
    setModal(null);
  };

  const availBadge = (av) => {
    if (av === 'Available') return <span className="admin-badge success">{av}</span>;
    if (av === 'Borrowed') return <span className="admin-badge warning">{av}</span>;
    return <span className="admin-badge info">{av}</span>;
  };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Book Management</div>
          <div className="admin-section-subtitle">{books.length} books in catalog</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setModal('add')}>
          <Plus size={14} /> Add Book
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar-left">
            <div className="admin-search">
              <Search size={14} color="var(--admin-text-dim)" />
              <input placeholder="Search title, author, ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)', display: 'flex' }}><X size={12} /></button>}
            </div>
            <select className="admin-select" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="admin-select" value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)}>
              <option value="">All Status</option>
              <option>Available</option><option>Borrowed</option><option>Reserved</option>
            </select>
          </div>
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{filtered.length} results</span>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><BookOpen size={28} /></div>
              <div className="admin-empty-title">No books found</div>
              <div className="admin-empty-text">Try adjusting your filters or add a new book.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Year</th>
                  <th>Pages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div className="admin-avatar-cell">
                        {b.cover ? (
                          <img src={b.cover} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 48, background: 'var(--admin-surface-2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BookOpen size={14} color="var(--admin-text-dim)" />
                          </div>
                        )}
                        <div>
                          <div className="admin-cell-primary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                          <div className="admin-cell-secondary">{b.author}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-badge primary"><Tag size={9} />{b.category}</span></td>
                    <td>{availBadge(b.availability)}</td>
                    <td><span style={{ color: 'var(--admin-warning)', fontWeight: 600 }}>★ {b.rating}</span></td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{b.year}</td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{b.pages}</td>
                    <td>
                      <div className="admin-action-group">
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setModal(b)} title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(b)} title="Delete">
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
      </div>

      {modal && (
        <BookModal
          book={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.title}"? This will also remove all borrow records for this book.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
