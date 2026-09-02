import { useMemo, useState } from 'react';
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
  User,
  Users,
  X,
} from 'lucide-react';
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { libraryBooks, libraryFeatures, recentActivities } from './services/api-backend';
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
  { label: 'Logout', to: '/', icon: LogOut, action: 'logout' },
];

const userBooks = [
  { title: 'Java Programming', author: 'Liam Carter', progress: 65, dueDate: '2026-09-10', cover: 'https://images.unsplash.com/photo-1516979187454-437ec7d8d4b8?auto=format&fit=crop&w=600&q=80' },
  { title: 'Machine Learning', author: 'Olivia Reed', progress: 42, dueDate: '2026-09-18', cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80' },
  { title: 'Artificial Intelligence', author: 'Noah Green', progress: 80, dueDate: '2026-09-22', cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
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

function AppShell() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPaths = ['/dashboard', '/profile', '/my-books', '/browse-books', '/reading-history', '/favorites', '/notifications', '/settings'];
  const isDashboardRoute = dashboardPaths.includes(location.pathname);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {!isDashboardRoute ? (
        <header className="topbar">
          <nav className="nav container">
            <div className="brand-wrap">
              <div className="brand-mark">L</div>
              <div>
                <div className="brand-name">Lumen Library</div>
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
                    <button type="button" className="nav-btn primary" onClick={handleLogout}>Logout</button>
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

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
                <div className="feature-icon"><Icon size={18} /></div>
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
                <button type="button" className="view-btn">View Book</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />;
}

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

function BooksPage() {
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
              <button type="button" className="view-btn">View Book</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

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
        <h2>Let’s connect with your library team</h2>
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

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: 'Female',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.mobile.trim()) nextErrors.mobile = 'Mobile number is required.';
    else if (!/^[0-9]{10,15}$/.test(form.mobile.replace(/\s+/g, ''))) nextErrors.mobile = 'Enter a valid mobile number.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) nextErrors.password = 'Use 8+ characters with uppercase and number.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm password is required.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = await register({
      ...form,
      profilePhoto:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    if (!result.success) {
      setStatus(result.message);
      return;
    }

    setStatus('Registration successful! Please login to continue.');
    setForm({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      gender: 'Female',
    });

    setTimeout(() => navigate('/login'), 1200);
  };

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
                <span>Full Name</span>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
                {errors.fullName && <small>{errors.fullName}</small>}
              </label>
              <label>
                <span>Email Address</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
                {errors.email && <small>{errors.email}</small>}
              </label>
            </div>

            <div className="field-grid two-up">
              <label>
                <span>Mobile Number</span>
                <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="9876543210" />
                {errors.mobile && <small>{errors.mobile}</small>}
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

            <div className="field-grid two-up">
              <label>
                <span>Password</span>
                <div className="password-wrap">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Create password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                {errors.password && <small>{errors.password}</small>}
              </label>
              <label>
                <span>Confirm Password</span>
                <div className="password-wrap">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
                  <button type="button" onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                </div>
                {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
              </label>
            </div>

            {status ? <div className="status-banner success">{status}</div> : null}

            <button type="submit" className="primary-btn submit-btn">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
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

    navigate('/dashboard');
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

            {error ? <div className="status-banner error">{error}</div> : null}

            <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-links-row">
              <button type="button" className="link-btn">Forgot Password?</button>
              <button type="button" className="link-btn" onClick={() => navigate('/register')}>Create New Account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <DashboardShell />;
}

function DashboardShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (link) => {
    if (link.action === 'logout') {
      logout();
      navigate('/');
      return;
    }

    navigate(link.to);
    setSidebarOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(searchQuery.trim() ? `/browse-books?search=${encodeURIComponent(searchQuery.trim())}` : '/browse-books');
  };

  return (
    <div className="dashboard-shell">
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
          {dashboardLinks.map(({ label, to, icon: Icon, action }) => (
            <button key={label} type="button" className="sidebar-link" onClick={() => handleNavigate({ to, action })}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user-card">
          <img src={user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'} alt="Profile" />
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
            <img src={user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'} alt="Profile" className="user-avatar" />
          </div>
        </header>

        <div className="dashboard-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const stats = [
    { label: 'Books Borrowed', value: '12', icon: BookCopy },
    { label: 'Books Read', value: '28', icon: BookText },
    { label: 'Favorites', value: '8', icon: Heart },
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
          <button type="button" className="primary-btn small-btn" onClick={() => window.location.href = '/browse-books'}>Explore Books</button>
          <button type="button" className="secondary-btn small-btn" onClick={() => window.location.href = '/profile'}>View Profile</button>
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
            <button type="button" className="text-btn">View All</button>
          </div>
          <div className="reading-list">
            {userBooks.map((book) => (
              <div key={book.title} className="reading-card">
                <img src={book.cover} alt={book.title} />
                <div className="reading-text">
                  <div className="reading-topline">
                    <h4>{book.title}</h4>
                    <span>{book.author}</span>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: `${book.progress}%` }} />
                  </div>
                  <div className="reading-meta">
                    <span>Progress: {book.progress}%</span>
                    <button type="button" className="mini-btn">Continue Reading</button>
                  </div>
                </div>
              </div>
            ))}
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

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus('');
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setStatus('Full name and email are required.');
      return;
    }

    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);

    if (!result.success) {
      setStatus(result.message);
      return;
    }

    setEditing(false);
    setStatus('Profile saved successfully.');
  };

  return (
    <section className="section container page-section dashboard-content-page">
      <div className="panel profile-panel">
        <div className="profile-header">
          <img src={user?.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'} alt="Profile" className="profile-avatar" />
          <div>
            <span className="eyebrow dark"><CircleUserRound size={16} /> Student Profile</span>
            <h2>{user?.fullName}</h2>
          </div>
          {editing ? (
            <div className="profile-actions">
              <button type="button" className="secondary-btn small-btn" onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className="primary-btn small-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          ) : (
            <button type="button" className="primary-btn small-btn" onClick={() => { setStatus(''); setEditing(true); }}>Edit Profile</button>
          )}
        </div>

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
            {status ? <div className="profile-status">{status}</div> : null}
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-item"><span>Full Name</span><strong>{user?.fullName}</strong></div>
            <div className="profile-item"><span>Email</span><strong>{user?.email}</strong></div>
            <div className="profile-item"><span>Mobile</span><strong>{user?.mobile}</strong></div>
            <div className="profile-item"><span>Date of Birth</span><strong>{user?.dateOfBirth}</strong></div>
            <div className="profile-item"><span>Gender</span><strong>{user?.gender}</strong></div>
            <div className="profile-item"><span>College</span><strong>{user?.college}</strong></div>
            <div className="profile-item"><span>Course</span><strong>{user?.course}</strong></div>
            <div className="profile-item"><span>Academic Year</span><strong>{user?.academicYear}</strong></div>
            <div className="profile-item wide"><span>Address</span><strong>{user?.address}</strong></div>
          </div>
        )}
        {!editing && status ? <div className="profile-status">{status}</div> : null}
      </div>
    </section>
  );
}

function MyBooksPage() {
  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><BookCopy size={16} /> My Books</span>
        <h2>Currently borrowed by you</h2>
      </div>
      <div className="book-grid large-grid">
        {userBooks.map((book) => (
          <article key={book.title} className="book-card borrowed-card">
            <img src={book.cover} alt={book.title} className="book-cover" />
            <div className="book-body">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <div className="issued-row"><span>Issue Date</span><strong>2026-08-05</strong></div>
              <div className="issued-row"><span>Due Date</span><strong>{book.dueDate}</strong></div>
              <div className="progress-bar"><span style={{ width: `${book.progress}%` }} /></div>
              <div className="label-row"><span>Reading Progress: {book.progress}%</span></div>
              <div className="borrow-actions">
                <button type="button" className="secondary-btn small-btn">Return Book</button>
                <button type="button" className="primary-btn small-btn">Continue Reading</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BrowseBooksPage() {
  return (
    <section className="section container page-section">
      <div className="section-header split">
        <div>
          <span className="eyebrow dark"><Search size={16} /> Browse Books</span>
          <h2>Find your next study companion</h2>
        </div>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search books" />
        <select><option>Category</option></select>
        <select><option>Author</option></select>
        <select><option>Rating</option></select>
        <select><option>Availability</option></select>
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
              <button type="button" className="view-btn">View Book</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReadingHistoryPage() {
  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><Clock3 size={16} /> Reading History</span>
        <h2>Your recent learning timeline</h2>
      </div>
      <div className="timeline history-timeline">
        <div className="timeline-item"><span className="timeline-dot">✓</span><span>Completed chapter 6 of Machine Learning</span></div>
        <div className="timeline-item"><span className="timeline-dot">✓</span><span>Read 2 hours of Java Programming</span></div>
        <div className="timeline-item"><span className="timeline-dot">✓</span><span>Finished AI notes and summary</span></div>
        <div className="timeline-item"><span className="timeline-dot">✓</span><span>Reviewed database practice exercises</span></div>
      </div>
    </section>
  );
}

function FavoritesPage() {
  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><Heart size={16} /> Favorites</span>
        <h2>Your bookmarked reads</h2>
      </div>
      <div className="book-grid large-grid">
        {libraryBooks.slice(0, 4).map((book) => (
          <article key={book.id} className="book-card">
            <img src={book.cover} alt={book.title} className="book-cover" />
            <div className="book-body">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <button type="button" className="view-btn">Open Book</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NotificationsPage() {
  return (
    <section className="section container page-section">
      <div className="section-header">
        <span className="eyebrow dark"><Bell size={16} /> Notifications</span>
        <h2>Latest updates from your library</h2>
      </div>
      <div className="notification-list">
        <div className="notification-item"><CheckCircle2 size={18} /> Your book 'Java Programming' is due soon.</div>
        <div className="notification-item"><CheckCircle2 size={18} /> New AI course notes are available.</div>
        <div className="notification-item"><CheckCircle2 size={18} /> Your library profile was successfully updated.</div>
      </div>
    </section>
  );
}

function SettingsPage() {
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
            <button type="button" className="text-btn">Configure</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function PageNotFound() {
  return (
    <section className="section container empty-state">
      <h2>Page not found</h2>
      <button type="button" className="primary-btn" onClick={() => window.location.href = '/'}>Return Home</button>
    </section>
  );
}

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
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
