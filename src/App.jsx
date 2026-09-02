import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookCopy,
  BookMarked,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GraduationCap,
  Heart,
  Home,
  LibraryBig,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  MonitorSmartphone,
  MoonStar,
  Phone,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  addToFavorites,
  borrowBook,
  getFavorites,
  getBooks,
  getMyBooks,
  getNotifications,
  libraryBooks,
  libraryFeatures,
  markAllNotificationsRead,
  markNotificationRead,
  recentActivities,
  removeFromFavorites,
  resetPassword,
  returnBook,
} from './services/api-backend';
import AdminApp from './admin/AdminApp';

import './App.css';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Library', to: '/library', icon: LibraryBig },
  { label: 'Books', to: '/books', icon: BookOpen },
  { label: 'About', to: '/about', icon: Users },
  { label: 'Contact', to: '/contact', icon: MessageSquareText },
];

const dashboardLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'My Profile', to: '/profile', icon: User },
  { label: 'My Books', to: '/my-books', icon: BookCopy },
  { label: 'Browse Books', to: '/browse-books', icon: Search },
  { label: 'Reading History', to: '/reading-history', icon: Clock3 },
  { label: 'Favorites', to: '/favorites', icon: Heart },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Admin Panel', to: '/admin', icon: Shield, adminOnly: true },
  { label: 'Logout', to: '/', icon: LogOut, action: 'logout' },
];

const settingsSections = [
  { title: 'Account Settings', description: 'Update your personal account details', icon: Shield },
  { title: 'Profile Settings', description: 'Manage your public library profile', icon: User },
  { title: 'Password Settings', description: 'Secure your account with a new password', icon: Lock },
  { title: 'Notification Settings', description: 'Tune email and in-app updates', icon: Bell },
];

function formatName(name) {
  return name?.trim() || 'Reader';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Shared toast/banner component ───────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`status-banner ${type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{message}</span>
      <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem', color: 'inherit' }}>
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────

function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="logout-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-label="Confirm logout">
      <div className="logout-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon-wrap">
          <div className="logout-modal-icon">
            <LogOut size={28} />
          </div>
        </div>
        <h3 className="logout-modal-title">Sign Out?</h3>
        <p className="logout-modal-desc">
          You are about to sign out of your account. Any unsaved changes will be lost.
        </p>
        <div className="logout-modal-actions">
          <button type="button" className="logout-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="logout-confirm-btn" onClick={onConfirm}>
            <LogOut size={16} />
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPaths = ['/dashboard', '/profile', '/my-books', '/browse-books', '/reading-history', '/favorites', '/notifications', '/settings'];
  const isDashboardRoute = dashboardPaths.some((p) => location.pathname.startsWith(p));

  const handleLogoutConfirm = () => {
    logout();
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />

      {!isDashboardRoute ? (
        <header className="topbar">
          <nav className="nav container">
            <div className="brand-wrap">
              <div className="brand-mark">H</div>
              <div>
                <div className="brand-name">HUMAM Digital Library</div>
                <div className="brand-subtitle">Digital Learning</div>
              </div>
            </div>

            <button className="nav-toggle" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>

            <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
              {navItems.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}

              <div className="nav-actions">
                {isAuthenticated ? (
                  <>
                    <NavLink to="/dashboard" className="nav-btn secondary" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <button type="button" className="nav-btn primary" onClick={() => setShowLogoutModal(true)}>Logout</button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="nav-btn secondary" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </NavLink>
                    <NavLink to="/register" className="nav-btn primary" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </nav>
        </header>
      ) : null}

      {isDashboardRoute ? (
        <Outlet />
      ) : (
        <main>
          <Outlet />
        </main>
      )}
    </>
  );
}

// ─── Book Detail Modal (shared) ───────────────────────────────────────────────

function BookDetailModal({ book, onClose, onBorrowSuccess, onFavoriteSuccess }) {
  const { user } = useAuth();
  const [borrowing, setBorrowing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!book) return null;

  const statusClass = book.availability === 'Available' ? 'available' : book.availability === 'Borrowed' ? 'borrowed' : 'reserved';

  const handleBorrow = async () => {
    setBorrowing(true);
    setActionMsg('');
    const result = await borrowBook(book.id || book.bookId || book._id);
    setBorrowing(false);
    if (result.success) {
      setActionMsg(result.message);
      setActionType('success');
      if (onBorrowSuccess) onBorrowSuccess(book);
    } else {
      setActionMsg(result.message);
      setActionType('error');
    }
  };

  const handleFavorite = async () => {
    setFavoriting(true);
    setActionMsg('');
    const result = await addToFavorites(book.id || book.bookId || book._id);
    setFavoriting(false);
    setActionMsg(result.message);
    setActionType(result.success ? 'success' : 'error');
    if (result.success && onFavoriteSuccess) onFavoriteSuccess(book);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={book.title}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="modal-content">
          <div className="modal-cover-wrap">
            <img src={book.cover} alt={book.title} className="modal-cover" />
            <span className={`status modal-status ${statusClass}`}>{book.availability}</span>
          </div>
          <div className="modal-info">
            <span className="category-pill">{book.category}</span>
            <h2 className="modal-title">{book.title}</h2>
            <p className="modal-author">by {book.author}</p>
            <div className="modal-rating">
              <Star size={16} fill="currentColor" />
              <strong>{book.rating}</strong>
              <span>/ 5.0</span>
            </div>
            {book.description && <p className="modal-description">{book.description}</p>}
            <div className="modal-meta">
              {book.isbn && <div className="meta-item"><Shield size={15} /><span>ISBN: {book.isbn}</span></div>}
              {book.pages && <div className="meta-item"><FileText size={15} /><span>{book.pages} pages</span></div>}
              {book.year && <div className="meta-item"><CalendarDays size={15} /><span>Published {book.year}</span></div>}
            </div>

            {actionMsg && (
              <div className={`status-banner ${actionType === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '0.75rem' }}>
                {actionMsg}
              </div>
            )}

            <div className="modal-actions">
              {book.availability === 'Available' && (
                <button type="button" className="primary-btn modal-action-btn" onClick={handleBorrow} disabled={borrowing}>
                  {borrowing ? 'Borrowing...' : 'Borrow Book'}
                </button>
              )}
              <button type="button" className="secondary-btn modal-action-btn" onClick={handleFavorite} disabled={favoriting}>
                {favoriting ? 'Adding...' : 'Add to Favorites'}
              </button>
              <button type="button" className="ghost-btn modal-action-btn" onClick={onClose}>
                Back to Books
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Book Detail Page (standalone /book/:id) ──────────────────────────────────

function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');
  const [borrowing, setBorrowing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: `/book/${bookId}` } }} />;
  }

  const book = libraryBooks.find((item) => String(item.id) === String(bookId));

  if (!book) {
    return (
      <section className="section container empty-state">
        <h2>Book not found</h2>
        <button type="button" className="primary-btn" onClick={() => navigate('/books')}>Back to Books</button>
      </section>
    );
  }

  const statusClass = book.availability === 'Available' ? 'available' : book.availability === 'Borrowed' ? 'borrowed' : 'reserved';

  const handleBorrow = async () => {
    setBorrowing(true);
    setActionMsg('');
    const result = await borrowBook(book.id);
    setBorrowing(false);
    setActionMsg(result.message);
    setActionType(result.success ? 'success' : 'error');
  };

  const handleFavorite = async () => {
    setFavoriting(true);
    setActionMsg('');
    const result = await addToFavorites(book.id);
    setFavoriting(false);
    setActionMsg(result.message);
    setActionType(result.success ? 'success' : 'error');
  };

  return (
    <section className="section container page-section">
      <div className="book-detail-page">
        <button type="button" className="secondary-btn" onClick={() => navigate('/books')}>Back to Books</button>
        <div className="modal-content book-detail-layout">
          <div className="modal-cover-wrap">
            <img src={book.cover} alt={book.title} className="modal-cover" />
            <span className={`status modal-status ${statusClass}`}>{book.availability}</span>
          </div>
          <div className="modal-info">
            <span className="category-pill">{book.category}</span>
            <h2 className="modal-title">{book.title}</h2>
            <p className="modal-author">by {book.author}</p>
            <div className="modal-rating">
              <Star size={16} fill="currentColor" />
              <strong>{book.rating}</strong>
              <span>/ 5.0</span>
            </div>
            <p className="modal-description">{book.description}</p>
            <div className="modal-meta">
              {book.isbn && <div className="meta-item"><Shield size={15} /><span>ISBN: {book.isbn}</span></div>}
              <div className="meta-item"><FileText size={15} /><span>{book.pages} pages</span></div>
              <div className="meta-item"><CalendarDays size={15} /><span>Published {book.year}</span></div>
            </div>

            {actionMsg && (
              <div className={`status-banner ${actionType === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '0.75rem' }}>
                {actionMsg}
              </div>
            )}

            <div className="modal-actions">
              {book.availability === 'Available' && (
                <button type="button" className="primary-btn modal-action-btn" onClick={handleBorrow} disabled={borrowing}>
                  {borrowing ? 'Borrowing...' : 'Borrow Book'}
                </button>
              )}
              <button type="button" className="secondary-btn modal-action-btn" onClick={handleFavorite} disabled={favoriting}>
                {favoriting ? 'Adding...' : 'Add to Favorites'}
              </button>
              <button type="button" className="ghost-btn modal-action-btn" onClick={() => navigate('/books')}>
                Back to Books
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const featuredBooks = libraryBooks.slice(0, 5);

  const handleViewBook = (book) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: `/book/${book.id}` },
          message: `Please login or register to view "${book.title}".`,
        },
      });
      return;
    }
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={16} /> Digital Learning Hub</span>
            <h1>Discover. Learn. Explore.</h1>
            <p>
              Your digital library platform to discover books, manage your profile, and access your learning journey from one place.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-btn" onClick={() => navigate('/books')}>
                Explore Library <ChevronRight size={18} />
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
                {isAuthenticated ? 'Go to Dashboard' : 'Register Now'}
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <strong>10,000+</strong>
                <span>Books</span>
              </div>
              <div className="stat-card">
                <strong>5,000+</strong>
                <span>Members</span>
              </div>
              <div className="stat-card">
                <strong>500+</strong>
                <span>Categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <span className="eyebrow dark"><LibraryBig size={16} /> Library Experience</span>
          <h2>Everything you need for focused learning</h2>
        </div>

        <div className="feature-grid">
          {libraryFeatures.map(({ title, description, icon: Icon, image }) => (
            <article key={title} className="feature-card">
              <div className="feature-image" style={{ backgroundImage: `url(${image})` }} />
              <div className="feature-body">
                <div className="feature-icon"><LibraryBig size={18} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-header split">
          <div>
            <span className="eyebrow dark"><BookMarked size={16} /> Featured Books</span>
            <h2>Popular reads for curious minds</h2>
          </div>
          <button type="button" className="ghost-btn" onClick={() => navigate('/books')}>Explore All Books</button>
        </div>

        <div className="book-grid">
          {featuredBooks.map((book) => (
            <article key={book.id} className="book-card">
              <img src={book.cover} alt={book.title} className="book-cover" />
              <div className="book-body">
                <div className="book-meta-row">
                  <span className="category-pill">{book.category}</span>
                  <span className="rating"><Star size={14} fill="currentColor" /> {book.rating}</span>
                </div>
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <div className="availability-row">
                  <span className={`status ${book.availability === 'Available' ? 'available' : book.availability === 'Borrowed' ? 'borrowed' : 'reserved'}`}>
                    {book.availability}
                  </span>
                </div>
                <button type="button" className="view-btn" onClick={() => handleViewBook(book)}>View Book</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LandingPage() {
  return <HomePage />;
}

// ─── Library Page ─────────────────────────────────────────────────────────────

function LibraryPage() {
  return (
    <section className="section container page-section">
      <div className="section-header center">
        <span className="eyebrow dark"><LibraryBig size={16} /> Our Library</span>
        <h2>Built to support modern academic journeys</h2>
      </div>

      <div className="library-showcase">
        <div className="showcase-card large">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80" alt="Library interior" />
          <div className="showcase-content">
            <h3>Digital Library Overview</h3>
            <p>Explore a curated network of digital resources, e-books, academic journals, and student learning spaces aligned to your coursework.</p>
          </div>
        </div>
        <div className="showcase-stack">
          <div className="showcase-card">
            <BookText size={32} />
            <h3>Reading Resources</h3>
            <p>Access chapter summaries, e-books, and essential references.</p>
          </div>
          <div className="showcase-card">
            <GraduationCap size={32} />
            <h3>Study Resources</h3>
            <p>Find guided learning materials, assignments, and milestones.</p>
          </div>
          <div className="showcase-card">
            <MonitorSmartphone size={32} />
            <h3>Online Access</h3>
            <p>Read on the go with secure access from any device.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Books Page (public) ──────────────────────────────────────────────────────

function BooksPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleViewBook = (book) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: `/book/${book.id}` },
          message: `Please login or register to view "${book.title}".`,
        },
      });
      return;
    }
    navigate(`/book/${book.id}`);
  };

  return (
    <section className="section container page-section">
      <div className="section-header split">
        <div>
          <span className="eyebrow dark"><BookOpen size={16} /> Browse Books</span>
          <h2>Discover your next favorite read</h2>
        </div>
        <button type="button" className="ghost-btn">Explore All Books</button>
      </div>

      <div className="book-grid large-grid">
        {libraryBooks.map((book) => (
          <article key={book.id} className="book-card">
            <img src={book.cover} alt={book.title} className="book-cover" />
            <div className="book-body">
              <div className="book-meta-row">
                <span className="category-pill">{book.category}</span>
                <span className="rating"><Star size={14} fill="currentColor" /> {book.rating}</span>
              </div>
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <div className="availability-row">
                <span className={`status ${book.availability === 'Available' ? 'available' : book.availability === 'Borrowed' ? 'borrowed' : 'reserved'}`}>
                  {book.availability}
                </span>
              </div>
              <button type="button" className="view-btn" onClick={() => handleViewBook(book)}>View Book</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── About / Contact Pages ────────────────────────────────────────────────────

function AboutPage() {
  return (
    <section className="section container page-section about-page">
      <div className="section-header center">
        <span className="eyebrow dark"><Users size={16} /> About Us</span>
        <h2>Empowering students through smarter reading</h2>
      </div>
      <div className="about-layout">
        <div className="about-card">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" alt="Students reading" />
        </div>
        <div className="about-text">
          <p>Lumen Library is designed for students and learners who want meaningful digital access to academic resources. We combine modern reading experiences, personalized profiles, and structured learning journeys into one elegant platform.</p>
          <ul>
            <li><ShieldCheck size={18} /> Secure member experience</li>
            <li><BookMarked size={18} /> Curated study collections</li>
            <li><Users size={18} /> Community-driven learning culture</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section container page-section">
      <div className="section-header center">
        <span className="eyebrow dark"><MessageSquareText size={16} /> Contact</span>
        <h2>Let's connect with your library team</h2>
      </div>
      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon"><Mail size={22} /></div>
          <h3>Email</h3>
          <p>support@lumenlibrary.edu</p>
        </div>
        <div className="contact-card">
          <div className="contact-icon"><Phone size={22} /></div>
          <h3>Phone</h3>
          <p>+1 (415) 320-9812</p>
        </div>
        <div className="contact-card">
          <div className="contact-icon"><MapPin size={22} /></div>
          <h3>Address</h3>
          <p>45 Scholar Avenue, New York</p>
        </div>
      </div>
    </section>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    gender: 'Female',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'mobile' && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email (e.g. username@gmail.com).';
    if (!form.mobile.trim()) nextErrors.mobile = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobile.trim())) nextErrors.mobile = 'Mobile number must be exactly 10 digits.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) nextErrors.password = 'Use 8+ characters with uppercase and number.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    const result = await register({
      ...form,
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });
    setIsLoading(false);

    if (!result.success) {
      setStatus(result.message);
      return;
    }

    setRegistered(true);
    const redirectFrom = location.state?.from || { pathname: '/dashboard' };
    setTimeout(() => navigate('/login', { state: { from: redirectFrom, message: location.state?.message || 'Welcome back!' } }), 3500);
  };

  if (registered) {
    return (
      <div className="reg-success-overlay">
        <div className="reg-success-card">
          <div className="reg-success-circle">
            <svg viewBox="0 0 80 80" className="reg-checkmark" xmlns="http://www.w3.org/2000/svg">
              <circle className="reg-circle" cx="40" cy="40" r="36" fill="none" strokeWidth="4" />
              <polyline className="reg-check" points="22,42 34,54 58,28" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="reg-success-title">Account Created!</h2>
          <p className="reg-success-sub">Welcome to Lumen Library, <strong>{form.fullName || 'Reader'}</strong>!<br />Redirecting you to login…</p>
          <div className="reg-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <span className="eyebrow"><LibraryBig size={16} /> Your Reading Journey</span>
          <h2>Build your academic library profile</h2>
          <p>Track your borrowed books, reading progress, personal favorites, and educational milestones in one secure place.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div>
              <span className="eyebrow dark"><User size={16} /> Join us</span>
              <h2>Create Your Library Account</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <div className="field-grid two-up">
              <label>
                <span>Full Name <em className="req-star">*</em></span>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
                {errors.fullName && <small className="field-error">{errors.fullName}</small>}
              </label>
              <label>
                <span>Email Address <em className="req-star">*</em></span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="username@gmail.com" autoComplete="email" />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>
            </div>

            <div className="field-grid two-up">
              <label>
                <span>Mobile Number <em className="req-star">*</em></span>
                <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit number" maxLength={10} inputMode="numeric" />
                {errors.mobile && <small className="field-error">{errors.mobile}</small>}
              </label>
              <label>
                <span>Gender</span>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>
            </div>

            <div className="field-grid">
              <label>
                <span>Password <em className="req-star">*</em></span>
                <div className="password-wrap">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="8+ chars, uppercase & number" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                {errors.password && <small className="field-error">{errors.password}</small>}
              </label>
            </div>

            {status && <div className="status-banner error">{status}</div>}

            <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
            <div className="auth-links-row">
              <button type="button" className="link-btn" onClick={() => navigate('/login')}>Already have an account? Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const result = await login(form.email, form.password);

    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    const redirectTo = result.user?.isAdmin
      ? '/admin'
      : (location.state?.from?.pathname || '/dashboard');

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-visual login-visual">
        <div className="auth-visual-content">
          <span className="eyebrow"><LibraryBig size={16} /> Welcome Back</span>
          <h2>Continue your digital reading journey</h2>
          <p>Access your books, reading history, and personal recommendations from a single connected dashboard.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card login-card">
          <div className="auth-header">
            <span className="eyebrow dark"><BookOpen size={16} /> Member Login</span>
            <h2>Login to your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" />
            </label>

            {location.state?.message ? <div className="status-banner error">{location.state.message}</div> : null}
            {error ? <div className="status-banner error">{error}</div> : null}

            <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-links-row">
              <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
              <button type="button" className="link-btn" onClick={() => navigate('/register')}>Create New Account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Forgot Password Page ─────────────────────────────────────────────────────

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim()) { setError('Please enter your registered email address.'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    const result = await resetPassword(form.email.trim(), form.newPassword);
    setIsLoading(false);

    if (!result.success) { setError(result.message); return; }
    setStep('done');
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-visual login-visual">
        <div className="auth-visual-content">
          <span className="eyebrow"><Lock size={16} /> Reset Password</span>
          <h2>Regain access to your library account</h2>
          <p>Enter your registered email and choose a new password to restore access to your reading dashboard.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card login-card">
          <div className="auth-header">
            <span className="eyebrow dark"><ShieldCheck size={16} /> Password Reset</span>
            <h2>Forgot your password?</h2>
          </div>

          {step === 'done' ? (
            <div className="forgot-success">
              <div className="forgot-success-icon"><CheckCircle2 size={48} color="#16a34a" /></div>
              <h3>Password Updated!</h3>
              <p>Your password has been reset successfully. You can now log in with your new password.</p>
              <button type="button" className="primary-btn submit-btn" onClick={() => navigate('/login')}>
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <label>
                <span>Registered Email</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" />
              </label>
              <label>
                <span>New Password</span>
                <div className="password-wrap">
                  <input name="newPassword" type={showPassword ? 'text' : 'password'} value={form.newPassword} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              <label>
                <span>Confirm New Password</span>
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your new password" autoComplete="new-password" />
              </label>

              {error ? <div className="status-banner error">{error}</div> : null}

              <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <div className="auth-links-row">
                <button type="button" className="link-btn" onClick={() => navigate('/login')}>Back to Login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Protected Layout ─────────────────────────────────────────────────────────

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <DashboardShell />;
}

// ─── Dashboard Shell (Sidebar + Header) ──────────────────────────────────────

function DashboardShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNavigate = (link) => {
    if (link.action === 'logout') {
      setShowLogoutModal(true);
      return;
    }
    navigate(link.to);
    setSidebarOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(searchQuery.trim() ? `/browse-books?search=${encodeURIComponent(searchQuery.trim())}` : '/browse-books');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <div className="dashboard-shell">
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-wrap">
            <div className="brand-mark">L</div>
            <div>
              <div className="brand-name">Lumen</div>
              <div className="brand-subtitle">Library</div>
            </div>
          </div>
          <button type="button" className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {dashboardLinks
            .filter(({ adminOnly }) => !adminOnly || user?.isAdmin)
            .map(({ label, to, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              className={`sidebar-link ${!action && isActive(to) ? 'active' : ''}${label === 'Admin Panel' ? ' admin-panel-link' : ''}`}
              onClick={() => handleNavigate({ to, action })}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Admin Panel' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                  ADMIN
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-user-card">
          <img
            src={user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
            alt="Profile"
          />
          <div>
            <strong>{formatName(user?.fullName)}</strong>
            <span>{user?.email || 'Library member'}</span>
          </div>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button type="button" className="menu-button" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <p className="muted-label">Library Dashboard</p>
              <h2>Welcome Back, {formatName(user?.fullName)} 👋</h2>
            </div>
          </div>

          <div className="header-right">
            <form className="dashboard-search" onSubmit={handleSearch}>
              <Search size={17} />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search books" aria-label="Search books" />
              <button type="submit" aria-label="Search books"><ChevronRight size={16} /></button>
            </form>
            <button type="button" className="header-icon" onClick={() => navigate('/notifications')} aria-label="View notifications"><Bell size={18} /></button>
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
              alt="Profile"
              className="user-avatar"
            />
          </div>
        </header>

        <div className="dashboard-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myBooksData, setMyBooksData] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [booksRes, favsRes] = await Promise.all([getMyBooks(), getFavorites()]);
      if (booksRes.success) setMyBooksData(booksRes.books.filter((b) => b.status === 'Borrowed'));
      if (favsRes.success) setFavCount(favsRes.books.length);
      setLoading(false);
    }
    load();
  }, []);

  const activeBorrows = myBooksData.length;
  const stats = [
    { label: 'Books Borrowed', value: loading ? '…' : String(activeBorrows), icon: BookCopy },
    { label: 'Books Read', value: '28', icon: BookText },
    { label: 'Favorites', value: loading ? '…' : String(favCount), icon: Heart },
    { label: 'Reading Progress', value: '75%', icon: ChartIcon },
  ];

  const monthlyBooks = [
    { label: 'Jan', value: 3 },
    { label: 'Feb', value: 5 },
    { label: 'Mar', value: 7 },
    { label: 'Apr', value: 6 },
    { label: 'May', value: 9 },
    { label: 'Jun', value: 8 },
  ];
  const analytics = [
    { label: 'Reading hours', value: '42 hrs', detail: 'This month', progress: 72, icon: Clock3 },
    { label: 'Pages read', value: '1,248', detail: 'Across 6 books', progress: 84, icon: FileText },
    { label: 'Reading progress', value: '75%', detail: 'Monthly goal reached', progress: 75, icon: ChartIcon },
  ];
  const favoriteCategories = [
    { label: 'Programming', value: 38 },
    { label: 'Artificial Intelligence', value: 27 },
    { label: 'Databases', value: 18 },
  ];

  // Show the 3 most recently borrowed books
  const currentlyReading = myBooksData.slice(0, 3);

  return (
    <>
      <div className="stats-grid dashboard-stats">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card dashboard-stat-card">
            <div className="stat-icon"><Icon size={18} /></div>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="panel dashboard-intro">
        <div>
          <span className="eyebrow dark"><Sparkles size={16} /> Your Learning Snapshot</span>
          <h3>Keep your learning momentum going</h3>
          <p>Continue a current book, explore new subjects, or update your profile so your library experience stays personal.</p>
        </div>
        <div className="dashboard-intro-actions">
          <button type="button" className="primary-btn small-btn" onClick={() => navigate('/browse-books')}>Explore Books</button>
          <button type="button" className="secondary-btn small-btn" onClick={() => navigate('/profile')}>View Profile</button>
        </div>
      </section>

      <section className="analytics-section">
        <div className="section-header dashboard-section-header">
          <div>
            <span className="eyebrow dark"><ChartIcon size={16} /> My Reading Analytics</span>
            <h2>See how your reading is growing</h2>
          </div>
          <span className="analytics-period">Last 6 months</span>
        </div>

        <div className="analytics-grid">
          <section className="panel analytics-card monthly-card">
            <div className="panel-header">
              <div><h3>Books read per month</h3><p>Completed books</p></div>
              <BookText size={20} className="analytics-icon" />
            </div>
            <div className="monthly-bars">
              {monthlyBooks.map((month) => (
                <div className="month-bar" key={month.label}>
                  <strong>{month.value}</strong>
                  <span style={{ height: `${month.value * 9}%` }} />
                  <small>{month.label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="panel analytics-card">
            <div className="panel-header"><div><h3>Reading activity</h3><p>Your monthly targets</p></div><Clock3 size={20} className="analytics-icon" /></div>
            <div className="analytics-metrics">
              {analytics.map(({ label, value, detail, progress, icon: Icon }) => (
                <div className="analytics-metric" key={label}>
                  <div className="metric-heading"><span><Icon size={15} /> {label}</span><strong>{value}</strong></div>
                  <div className="analytics-progress"><span style={{ width: `${progress}%` }} /></div>
                  <small>{detail}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="panel analytics-card categories-card">
            <div className="panel-header"><div><h3>Favorite categories</h3><p>Based on your reading</p></div><Heart size={20} className="analytics-icon" /></div>
            <div className="category-bars">
              {favoriteCategories.map(({ label, value }) => (
                <div className="category-bar" key={label}>
                  <div><span>{label}</span><strong>{value}%</strong></div>
                  <div className="analytics-progress"><span style={{ width: `${value * 2}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <div className="dashboard-row">
        <section className="panel panel-large">
          <div className="panel-header">
            <h3>Continue Reading</h3>
            <button type="button" className="text-btn" onClick={() => navigate('/my-books')}>View All</button>
          </div>
          <div className="reading-list">
            {loading ? (
              <p style={{ padding: '1rem', color: 'var(--muted)' }}>Loading your books…</p>
            ) : currentlyReading.length === 0 ? (
              <div style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '0.75rem' }}>You haven't borrowed any books yet.</p>
                <button type="button" className="primary-btn small-btn" onClick={() => navigate('/browse-books')}>Browse Books</button>
              </div>
            ) : (
              currentlyReading.map((record) => (
                <div key={record.recordId} className="reading-card">
                  <img src={record.book.cover} alt={record.book.title} />
                  <div className="reading-text">
                    <div className="reading-topline">
                      <h4>{record.book.title}</h4>
                      <span>{record.book.author}</span>
                    </div>
                    <div className="progress-bar">
                      <span style={{ width: '40%' }} />
                    </div>
                    <div className="reading-meta">
                      <span>Due: {formatDate(record.dueDate)}</span>
                      <button type="button" className="mini-btn" onClick={() => navigate('/my-books')}>View Details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="timeline">
            {recentActivities.map((activity, index) => (
              <div key={activity} className="timeline-item">
                <span className="timeline-dot">{index < 4 ? '✓' : ''}</span>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'Female',
    college: user?.college || '',
    course: user?.course || '',
    academicYear: user?.academicYear || '',
    address: user?.address || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'Female',
        college: user.college || '',
        course: user.course || '',
        academicYear: user.academicYear || '',
        address: user.address || '',
      });
      if (user.profilePhoto && photoPreview && user.profilePhoto === photoPreview) {
        setPhotoPreview(null);
      }
    }
  }, [user]);

  const currentPhoto = photoPreview || user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus('');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('Please select a valid image file.');
      setStatusType('error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus('Image must be smaller than 2 MB.');
      setStatusType('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPhotoPreview(dataUrl);
      setUploadingPhoto(true);
      setStatus('');
      const result = await updateProfile({ profilePhoto: dataUrl });
      setUploadingPhoto(false);
      if (result.success) {
        setStatus('Profile photo updated successfully!');
        setStatusType('success');
      } else {
        setStatus(result.message || 'Failed to update photo. Please try a smaller image.');
        setStatusType('error');
        setPhotoPreview(null);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setStatus('Full name and email are required.');
      setStatusType('error');
      return;
    }

    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);

    if (!result.success) {
      setStatus(result.message);
      setStatusType('error');
      return;
    }

    setEditing(false);
    setStatus('Profile saved successfully.');
    setStatusType('success');
  };

  return (
    <section className="section container page-section dashboard-content-page">
      <div className="panel profile-panel">
        <div className="profile-header">
          <div className="avatar-upload-wrap">
            <img src={currentPhoto} alt="Profile" className="profile-avatar" />
            {uploadingPhoto && (
              <div className="avatar-uploading-overlay">Saving...</div>
            )}
            <label htmlFor="profile-photo-input" className="avatar-upload-btn" title="Change profile photo">
              <Camera size={16} />
            </label>
            <input
              ref={fileInputRef}
              id="profile-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <span className="eyebrow dark"><CircleUserRound size={16} /> Student Profile</span>
            <h2>{user?.fullName}</h2>
            <p className="avatar-hint">Click the camera icon to change your photo</p>
          </div>
          {editing ? (
            <div className="profile-actions">
              <button type="button" className="secondary-btn small-btn" onClick={() => { setEditing(false); setStatus(''); }}>Cancel</button>
              <button type="button" className="primary-btn small-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          ) : (
            <button type="button" className="primary-btn small-btn" onClick={() => { setStatus(''); setEditing(true); }}>Edit Profile</button>
          )}
        </div>

        {status ? (
          <div className={`profile-status ${statusType === 'error' ? 'profile-status--error' : ''}`}>{status}</div>
        ) : null}

        {editing ? (
          <div className="profile-form-grid">
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="profile-field">
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                {key === 'gender' ? (
                  <select name={key} value={value} onChange={handleChange}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                ) : (
                  <input name={key} type={key === 'email' ? 'email' : key === 'dateOfBirth' ? 'date' : 'text'} value={value} onChange={handleChange} />
                )}
              </label>
            ))}
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-item"><span>Full Name</span><strong>{user?.fullName || '—'}</strong></div>
            <div className="profile-item"><span>Email</span><strong>{user?.email || '—'}</strong></div>
            <div className="profile-item"><span>Mobile</span><strong>{user?.mobile || '—'}</strong></div>
            <div className="profile-item"><span>Date of Birth</span><strong>{user?.dateOfBirth || '—'}</strong></div>
            <div className="profile-item"><span>Gender</span><strong>{user?.gender || '—'}</strong></div>
            <div className="profile-item"><span>College</span><strong>{user?.college || '—'}</strong></div>
            <div className="profile-item"><span>Course</span><strong>{user?.course || '—'}</strong></div>
            <div className="profile-item"><span>Academic Year</span><strong>{user?.academicYear || '—'}</strong></div>
            <div className="profile-item wide"><span>Address</span><strong>{user?.address || '—'}</strong></div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── My Books Page ────────────────────────────────────────────────────────────

function MyBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [returning, setReturning] = useState(null);

  const loadBooks = async () => {
    setLoading(true);
    const result = await getMyBooks();
    if (result.success) setBooks(result.books);
    setLoading(false);
  };

  useEffect(() => { loadBooks(); }, []);

  const handleReturn = async (record) => {
    setReturning(record.recordId);
    const result = await returnBook(record.recordId);
    setReturning(null);
    setToast({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) loadBooks();
  };

  const statusClass = (s) => s === 'Borrowed' ? 'borrowed' : s === 'Returned' ? 'available' : 'reserved';

  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><BookCopy size={16} /> My Books</span>
        <h2>Currently borrowed by you</h2>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>Loading your books…</p>
      ) : books.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <BookCopy size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <h3>No books borrowed yet</h3>
          <p style={{ color: 'var(--muted)' }}>Browse the library and borrow your first book!</p>
        </div>
      ) : (
        <div className="book-grid large-grid">
          {books.map((record) => (
            <article key={record.recordId} className="book-card borrowed-card">
              <img src={record.book.cover} alt={record.book.title} className="book-cover" />
              <div className="book-body">
                <div className="book-meta-row">
                  <span className="category-pill">{record.book.category}</span>
                  <span className={`status ${statusClass(record.status)}`}>{record.status}</span>
                </div>
                <h3>{record.book.title}</h3>
                <p className="author">by {record.book.author}</p>
                <div className="issued-row"><span>Borrow Date</span><strong>{formatDate(record.borrowDate)}</strong></div>
                <div className="issued-row"><span>Due Date</span><strong>{formatDate(record.dueDate)}</strong></div>
                {record.returnDate && (
                  <div className="issued-row"><span>Returned</span><strong>{formatDate(record.returnDate)}</strong></div>
                )}
                {record.status === 'Borrowed' && (
                  <div className="borrow-actions">
                    <button
                      type="button"
                      className="secondary-btn small-btn"
                      onClick={() => handleReturn(record)}
                      disabled={returning === record.recordId}
                    >
                      {returning === record.recordId ? 'Returning…' : 'Return Book'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Browse Books Page (dashboard) ────────────────────────────────────────────

function BrowseBooksPage() {
  const location = useLocation();
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadBooks = async () => {
    setLoading(true);
    const result = await getBooks();
    if (result.success) {
      setAllBooks(result.books);
    } else {
      // Fallback to static data if API fails
      setAllBooks(libraryBooks);
    }
    setLoading(false);
  };

  useEffect(() => { loadBooks(); }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(allBooks.map((b) => b.category))].sort();
    return cats;
  }, [allBooks]);

  const filtered = useMemo(() => {
    return allBooks.filter((book) => {
      const matchSearch = !search || book.title.toLowerCase().includes(search.toLowerCase()) || book.author.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || book.category === categoryFilter;
      const matchAvail = !availabilityFilter || book.availability === availabilityFilter;
      return matchSearch && matchCat && matchAvail;
    });
  }, [allBooks, search, categoryFilter, availabilityFilter]);

  const handleBorrowSuccess = (book) => {
    setToast({ message: `"${book.title}" borrowed successfully!`, type: 'success' });
    setSelectedBook(null);
    loadBooks(); // refresh availability
  };

  const handleFavoriteSuccess = (book) => {
    setToast({ message: `"${book.title}" added to favorites!`, type: 'success' });
  };

  return (
    <section className="section container page-section">
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrowSuccess={handleBorrowSuccess}
          onFavoriteSuccess={handleFavoriteSuccess}
        />
      )}

      <div className="section-header split">
        <div>
          <span className="eyebrow dark"><Search size={16} /> Browse Books</span>
          <h2>Find your next study companion</h2>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="Borrowed">Borrowed</option>
          <option value="Reserved">Reserved</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>Loading books…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>No books match your search.</p>
      ) : (
        <div className="book-grid large-grid">
          {filtered.map((book) => (
            <article key={book.id || book.bookId} className="book-card">
              <img src={book.cover} alt={book.title} className="book-cover" />
              <div className="book-body">
                <div className="book-meta-row">
                  <span className="category-pill">{book.category}</span>
                  <span className="rating"><Star size={14} fill="currentColor" /> {book.rating}</span>
                </div>
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <div className="availability-row">
                  <span className={`status ${book.availability === 'Available' ? 'available' : book.availability === 'Borrowed' ? 'borrowed' : 'reserved'}`}>
                    {book.availability}
                  </span>
                </div>
                <button type="button" className="view-btn" onClick={() => setSelectedBook(book)}>View Book</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Reading History Page ─────────────────────────────────────────────────────

function ReadingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMyBooks();
      if (result.success) setHistory(result.books);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><Clock3 size={16} /> Reading History</span>
        <h2>Your recent learning timeline</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>Loading history…</p>
      ) : history.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <Clock3 size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <h3>No reading history yet</h3>
          <p style={{ color: 'var(--muted)' }}>Start borrowing books to build your reading history.</p>
        </div>
      ) : (
        <div className="timeline history-timeline">
          {history.map((record) => (
            <div key={record.recordId} className="timeline-item">
              <span className="timeline-dot">{record.status === 'Returned' ? '✓' : '📖'}</span>
              <span>
                <strong>{record.book.title}</strong>
                {' — '}
                {record.status === 'Returned'
                  ? `Returned on ${formatDate(record.returnDate)}`
                  : `Borrowed on ${formatDate(record.borrowDate)}, due ${formatDate(record.dueDate)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Favorites Page ───────────────────────────────────────────────────────────

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [removing, setRemoving] = useState(null);

  const loadFavorites = async () => {
    setLoading(true);
    const result = await getFavorites();
    if (result.success) setFavorites(result.books);
    setLoading(false);
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (fav) => {
    setRemoving(fav.favoriteId);
    const result = await removeFromFavorites(fav.book.id || fav.book.bookId || fav.book._id);
    setRemoving(null);
    setToast({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) loadFavorites();
  };

  return (
    <section className="section container page-section">
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrowSuccess={() => { setSelectedBook(null); setToast({ message: 'Book borrowed!', type: 'success' }); }}
          onFavoriteSuccess={() => {}}
        />
      )}

      <div className="section-header">
        <span className="eyebrow dark"><Heart size={16} /> Favorites</span>
        <h2>Your bookmarked reads</h2>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>Loading favorites…</p>
      ) : favorites.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <Heart size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <h3>No favorites yet</h3>
          <p style={{ color: 'var(--muted)' }}>Browse books and add them to your favorites list.</p>
        </div>
      ) : (
        <div className="book-grid large-grid">
          {favorites.map((fav) => (
            <article key={fav.favoriteId} className="book-card">
              <img src={fav.book.cover} alt={fav.book.title} className="book-cover" />
              <div className="book-body">
                <div className="book-meta-row">
                  <span className="category-pill">{fav.book.category}</span>
                  <span className="rating"><Star size={14} fill="currentColor" /> {fav.book.rating}</span>
                </div>
                <h3>{fav.book.title}</h3>
                <p className="author">by {fav.book.author}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0.5rem' }}>
                  Added {formatDate(fav.addedAt)}
                </p>
                <div className="borrow-actions">
                  <button type="button" className="view-btn" onClick={() => setSelectedBook(fav.book)}>Open Book</button>
                  <button
                    type="button"
                    className="secondary-btn small-btn"
                    onClick={() => handleRemove(fav)}
                    disabled={removing === fav.favoriteId}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Trash2 size={14} />
                    {removing === fav.favoriteId ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Notifications Page ───────────────────────────────────────────────────────

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getNotifications();
    if (result.success) setNotifications(result.notifications);
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const notifIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} style={{ color: '#16a34a' }} />;
    if (type === 'warning') return <Bell size={18} style={{ color: '#d97706' }} />;
    return <Bell size={18} />;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section className="section container page-section">
      <div className="section-header split">
        <div>
          <span className="eyebrow dark"><Bell size={16} /> Notifications</span>
          <h2>Latest updates from your library</h2>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="ghost-btn" onClick={handleMarkAllRead} disabled={markingAll}>
            {markingAll ? 'Marking…' : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem' }}>Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <Bell size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <h3>No notifications yet</h3>
          <p style={{ color: 'var(--muted)' }}>Notifications will appear here when you borrow, return, or favorite books.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="notification-item"
              style={{
                opacity: notif.read ? 0.6 : 1,
                cursor: notif.read ? 'default' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {notifIcon(notif.type)}
                <div>
                  <p style={{ margin: 0 }}>{notif.message}</p>
                  <small style={{ color: 'var(--muted)' }}>{formatDate(notif.createdAt)}</small>
                </div>
              </div>
              {!notif.read && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  const navigate = useNavigate();
  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><Settings size={16} /> Settings</span>
        <h2>Manage your account preferences</h2>
      </div>
      <div className="settings-grid">
        {settingsSections.map(({ title, description, icon: Icon }) => (
          <div key={title} className="settings-card">
            <div className="setting-icon"><Icon size={18} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                if (title === 'Account Settings' || title === 'Profile Settings') navigate('/profile');
                else if (title === 'Password Settings') navigate('/forgot-password');
                else if (title === 'Notification Settings') navigate('/notifications');
              }}
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <section className="section container empty-state">
      <h2>Page not found</h2>
      <button type="button" className="primary-btn" onClick={() => navigate('/')}>Return Home</button>
    </section>
  );
}

// ─── Chart Icon ───────────────────────────────────────────────────────────────

function ChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 18V8" />
      <path d="M10 18V4" />
      <path d="M16 18v-9" />
      <path d="M22 18v-6" />
    </svg>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin routes — handled entirely by AdminApp */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Main app routes */}
          <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="book/:bookId" element={<BookDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="my-books" element={<MyBooksPage />} />
              <Route path="browse-books" element={<BrowseBooksPage />} />
              <Route path="reading-history" element={<ReadingHistoryPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
