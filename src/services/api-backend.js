const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Session helpers ──────────────────────────────────────────────────────────

function setUserId(userId) {
  if (userId) {
    sessionStorage.setItem('userId', userId);
  } else {
    sessionStorage.removeItem('userId');
  }
}

function getUserId() {
  return sessionStorage.getItem('userId');
}

// ─── Static data (kept for homepage / offline fallback) ───────────────────────

export const libraryBooks = [
  {
    id: 1,
    title: 'Java Programming',
    author: 'Liam Carter',
    category: 'Programming',
    rating: 4.8,
    availability: 'Available',
    description: 'A comprehensive guide to Java programming from basics to advanced concepts including OOP, data structures, and design patterns.',
    pages: 520,
    year: 2023,
    isbn: '978-0-13-468599-1',
    cover: 'https://images.unsplash.com/photo-1516979187454-437ec7d8d4b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Python Fundamentals',
    author: 'Maya Brooks',
    category: 'Python',
    rating: 4.9,
    availability: 'Available',
    description: 'Master Python from scratch. Covers syntax, file handling, APIs, and real-world projects for beginners and intermediate developers.',
    pages: 460,
    year: 2024,
    isbn: '978-1-59327-584-6',
    cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Artificial Intelligence',
    author: 'Noah Green',
    category: 'AI',
    rating: 4.7,
    availability: 'Available',
    description: 'Explore the foundations of AI including search algorithms, knowledge representation, machine perception, and neural networks.',
    pages: 610,
    year: 2023,
    isbn: '978-0-13-604259-4',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Machine Learning',
    author: 'Olivia Reed',
    category: 'ML',
    rating: 4.9,
    availability: 'Available',
    description: 'Hands-on guide to machine learning algorithms, model evaluation, feature engineering, and deployment using Python and scikit-learn.',
    pages: 580,
    year: 2024,
    isbn: '978-1-491-96229-6',
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Web Development',
    author: 'Ethan Cole',
    category: 'Frontend',
    rating: 4.6,
    availability: 'Available',
    description: 'Full-stack web development covering HTML, CSS, JavaScript, React, Node.js, and deployment on cloud platforms.',
    pages: 495,
    year: 2023,
    isbn: '978-0-13-397884-7',
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Database Management',
    author: 'Sophia Lee',
    category: 'Databases',
    rating: 4.8,
    availability: 'Available',
    description: 'In-depth coverage of relational databases, SQL, indexing, transactions, normalization, and NoSQL systems like MongoDB.',
    pages: 430,
    year: 2022,
    isbn: '978-0-07-802216-5',
    cover: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    title: 'Data Structures & Algorithms',
    author: 'James Walker',
    category: 'CS Fundamentals',
    rating: 4.9,
    availability: 'Available',
    description: 'Comprehensive guide to arrays, linked lists, trees, graphs, sorting, and searching algorithms with time complexity analysis.',
    pages: 540,
    year: 2023,
    isbn: '978-0-13-231216-5',
    cover: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    title: 'Cloud Computing',
    author: 'Ava Mitchell',
    category: 'Cloud',
    rating: 4.6,
    availability: 'Available',
    description: 'Master AWS, Azure, and Google Cloud. Covers cloud architecture, microservices, serverless computing, and DevOps practices.',
    pages: 480,
    year: 2024,
    isbn: '978-1-491-96492-4',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 9,
    title: 'Cybersecurity Essentials',
    author: 'Lucas Bennett',
    category: 'Security',
    rating: 4.7,
    availability: 'Available',
    description: 'Essential guide to network security, ethical hacking, cryptography, vulnerability assessment, and incident response.',
    pages: 510,
    year: 2023,
    isbn: '978-1-119-56209-6',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 10,
    title: 'React & Next.js',
    author: 'Emma Johnson',
    category: 'Frontend',
    rating: 4.8,
    availability: 'Available',
    description: 'Build modern, performant web apps with React hooks, context, server-side rendering, and the Next.js App Router.',
    pages: 420,
    year: 2024,
    isbn: '978-1-801-81151-9',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 11,
    title: 'Deep Learning',
    author: 'Oliver Harris',
    category: 'AI',
    rating: 4.9,
    availability: 'Available',
    description: 'Practical deep learning with TensorFlow and PyTorch. Covers CNNs, RNNs, transformers, and generative AI models.',
    pages: 600,
    year: 2024,
    isbn: '978-0-262-03561-3',
    cover: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 12,
    title: 'Operating Systems',
    author: 'Isabella Clark',
    category: 'CS Fundamentals',
    rating: 4.5,
    availability: 'Available',
    description: 'Covers processes, threads, memory management, file systems, I/O, and virtualization with practical Unix/Linux examples.',
    pages: 565,
    year: 2022,
    isbn: '978-0-13-359162-0',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 13,
    title: 'Computer Networks',
    author: 'William Turner',
    category: 'Networking',
    rating: 4.6,
    availability: 'Available',
    description: 'Thorough introduction to TCP/IP, HTTP, DNS, routing protocols, network security, and modern 5G architecture.',
    pages: 490,
    year: 2023,
    isbn: '978-0-13-359107-1',
    cover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 14,
    title: 'Software Engineering',
    author: 'Charlotte White',
    category: 'Engineering',
    rating: 4.7,
    availability: 'Available',
    description: 'Agile methodologies, design patterns, UML, software architecture, testing strategies, and project management techniques.',
    pages: 440,
    year: 2023,
    isbn: '978-0-13-207036-9',
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 15,
    title: 'DevOps & CI/CD',
    author: 'Henry Thompson',
    category: 'DevOps',
    rating: 4.8,
    availability: 'Available',
    description: 'End-to-end DevOps with Docker, Kubernetes, Jenkins, GitHub Actions, and infrastructure-as-code using Terraform.',
    pages: 460,
    year: 2024,
    isbn: '978-1-098-10850-3',
    cover: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 16,
    title: 'Natural Language Processing',
    author: 'Mia Anderson',
    category: 'AI',
    rating: 4.7,
    availability: 'Available',
    description: 'Tokenization, embeddings, transformer models, BERT, GPT, and building practical NLP pipelines with Hugging Face.',
    pages: 530,
    year: 2024,
    isbn: '978-1-098-13661-2',
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 17,
    title: 'Mobile App Development',
    author: 'Benjamin Martin',
    category: 'Mobile',
    rating: 4.6,
    availability: 'Available',
    description: 'Cross-platform mobile development with React Native and Flutter. Build, test, and publish iOS and Android apps.',
    pages: 475,
    year: 2023,
    isbn: '978-1-617-29536-5',
    cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 18,
    title: 'Blockchain Technology',
    author: 'Amelia Robinson',
    category: 'Emerging Tech',
    rating: 4.5,
    availability: 'Available',
    description: 'Distributed ledger technology, smart contracts with Solidity, DeFi, NFTs, and enterprise blockchain solutions.',
    pages: 390,
    year: 2023,
    isbn: '978-1-098-11037-7',
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 19,
    title: 'Statistics for Data Science',
    author: 'Daniel Lewis',
    category: 'Data Science',
    rating: 4.8,
    availability: 'Available',
    description: 'Probability theory, hypothesis testing, regression, Bayesian inference, and statistical modeling with Python and R.',
    pages: 510,
    year: 2022,
    isbn: '978-1-491-95291-4',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 20,
    title: 'System Design',
    author: 'Grace Hall',
    category: 'Engineering',
    rating: 4.9,
    availability: 'Available',
    description: 'Design scalable systems: load balancing, caching, databases, message queues, microservices, and API design.',
    pages: 445,
    year: 2024,
    isbn: '978-1-098-11347-7',
    cover: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=600&q=80',
  },
];

export const libraryFeatures = [
  {
    title: 'Digital Library Overview',
    description: 'Browse curated academic collections, digital archives, and online reading spaces from one place.',
    icon: 'LibraryBig',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Reading Resources',
    description: 'Access chapter notes, e-books, and guided study sections designed for academic learning.',
    icon: 'BookText',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Study Resources',
    description: 'Track your learning path with practice tests, digital references, and reading schedules.',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Online Access',
    description: 'Read anywhere on mobile, tablet, or desktop with synchronized personal profiles and progress.',
    icon: 'MonitorSmartphone',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
  },
];

export const recentActivities = [
  'Registered library account',
  'Borrowed Java Programming',
  'Added Machine Learning to favorites',
  'Completed Artificial Intelligence chapter',
  'Updated profile',
];

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function registerUser(payload) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Registration failed.' };
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Cannot connect to server. Make sure the API server is running on port 5000.' };
  }
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Login failed.' };
    setUserId(data.user.id);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Cannot connect to server. Make sure the API server is running on port 5000.' };
  }
}

export async function getCurrentUser() {
  try {
    const userId = getUserId();
    if (!userId) return null;

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      clearCurrentUser();
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export function setCurrentUser(user) {
  if (user && user.id) setUserId(user.id);
}

export async function updateUser(userId, updates) {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Profile update failed.' };
    setCurrentUser(data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function resetPassword(email, newPassword) {
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Password reset failed.' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export function clearCurrentUser() {
  setUserId(null);
}

export async function sendOtp(email) {
  try {
    const response = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Failed to send OTP.' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function verifyOtp(email, otp) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Invalid or expired OTP.' };
    return { success: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// ─── Books API ────────────────────────────────────────────────────────────────

export async function getBooks() {
  try {
    const response = await fetch(`${API_BASE}/books`);
    const data = await response.json();
    if (!response.ok) return { success: false, books: [], message: data.message };
    return { success: true, books: data.books };
  } catch (error) {
    console.error('Get books error:', error);
    return { success: false, books: [], message: 'Cannot connect to server.' };
  }
}

export async function getBook(id) {
  try {
    const response = await fetch(`${API_BASE}/books/${id}`);
    const data = await response.json();
    if (!response.ok) return { success: false, book: null, message: data.message };
    return { success: true, book: data.book };
  } catch (error) {
    console.error('Get book error:', error);
    return { success: false, book: null, message: 'Cannot connect to server.' };
  }
}

// ─── Borrow API ───────────────────────────────────────────────────────────────

export async function borrowBook(bookId) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/books/${bookId}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to borrow book.' };
    return { success: true, message: data.message, record: data.record };
  } catch (error) {
    console.error('Borrow error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function getMyBooks() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/my-books`, {
      headers: { 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, books: [], message: data.message };
    return { success: true, books: data.books };
  } catch (error) {
    console.error('My books error:', error);
    return { success: false, books: [], message: 'Cannot connect to server.' };
  }
}

export async function returnBook(recordId) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/my-books/${recordId}/return`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to return book.' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Return error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// ─── Favorites API ────────────────────────────────────────────────────────────

export async function addToFavorites(bookId) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/books/${bookId}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to add to favorites.' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Add favorite error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function removeFromFavorites(bookId) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/books/${bookId}/favorite`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to remove from favorites.' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Remove favorite error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function getFavorites() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/favorites`, {
      headers: { 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, books: [], message: data.message };
    return { success: true, books: data.books };
  } catch (error) {
    console.error('Get favorites error:', error);
    return { success: false, books: [], message: 'Cannot connect to server.' };
  }
}

// ─── Notifications API ────────────────────────────────────────────────────────

export async function getNotifications() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE}/notifications`, {
      headers: { 'x-user-id': userId },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, notifications: [], message: data.message };
    return { success: true, notifications: data.notifications };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, notifications: [], message: 'Cannot connect to server.' };
  }
}

export async function markNotificationRead(notifId) {
  try {
    const userId = getUserId();
    await fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { 'x-user-id': userId },
    });
  } catch (error) {
    console.error('Mark read error:', error);
  }
}

export async function markAllNotificationsRead() {
  try {
    const userId = getUserId();
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'x-user-id': userId },
    });
  } catch (error) {
    console.error('Mark all read error:', error);
  }
}

// ─── Admin API ────────────────────────────────────────────────────────────────

function getAdminHeaders() {
  return { 'Content-Type': 'application/json', 'x-user-id': getUserId() };
}

export async function adminGetStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAdminHeaders() });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };
    return { success: true, ...data };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminGetUsers(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${qs}`, { headers: getAdminHeaders() });
    const data = await res.json();
    if (!res.ok) return { success: false, users: [], message: data.message };
    return { success: true, users: data.users, total: data.total };
  } catch {
    return { success: false, users: [], message: 'Cannot connect to server.' };
  }
}

export async function adminCreateUser(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, user: data.user, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminUpdateUser(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, user: data.user, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminDeleteUser(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE', headers: getAdminHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminCreateBook(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/books`, {
      method: 'POST', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, book: data.book, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminUpdateBook(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/books/${id}`, {
      method: 'PUT', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, book: data.book, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminDeleteBook(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/books/${id}`, {
      method: 'DELETE', headers: getAdminHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminGetBorrowRecords(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/borrow-records?${qs}`, { headers: getAdminHeaders() });
    const data = await res.json();
    if (!res.ok) return { success: false, records: [], message: data.message };
    return { success: true, records: data.records, total: data.total };
  } catch {
    return { success: false, records: [], message: 'Cannot connect to server.' };
  }
}

export async function adminReturnBook(recordId) {
  try {
    const res = await fetch(`${API_BASE}/admin/borrow-records/${recordId}/return`, {
      method: 'PUT', headers: getAdminHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminGetActivityLogs(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/activity-logs?${qs}`, { headers: getAdminHeaders() });
    const data = await res.json();
    if (!res.ok) return { success: false, logs: [], message: data.message };
    return { success: true, logs: data.logs, total: data.total };
  } catch {
    return { success: false, logs: [], message: 'Cannot connect to server.' };
  }
}

export async function adminAIGenerateDescription(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/ai/generate-description`, {
      method: 'POST', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, description: data.description, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminAIRecommendCategory(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/ai/recommend-category`, {
      method: 'POST', headers: getAdminHeaders(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, category: data.category, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminAIChat(message, history = []) {
  try {
    const res = await fetch(`${API_BASE}/admin/ai/chat`, {
      method: 'POST', headers: getAdminHeaders(), body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    return { success: res.ok, reply: data.reply, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

export async function adminAIInsights() {
  try {
    const res = await fetch(`${API_BASE}/admin/ai/insights`, { headers: getAdminHeaders() });
    const data = await res.json();
    return { success: res.ok, insights: data.insights, aiGenerated: data.aiGenerated, message: data.message };
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
}

