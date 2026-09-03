import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/lumen_library');
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
});

// ─── Schemas ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    gender: { type: String, default: 'Female' },
    dateOfBirth: { type: String, default: '' },
    college: { type: String, default: '' },
    course: { type: String, default: '' },
    academicYear: { type: String, default: '' },
    address: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const bookSchema = new mongoose.Schema(
  {
    bookId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    availability: { type: String, enum: ['Available', 'Borrowed', 'Reserved'], default: 'Available' },
    description: { type: String, default: '' },
    pages: { type: Number, default: 0 },
    year: { type: Number, default: 2023 },
    isbn: { type: String, default: '' },
    cover: { type: String, default: '' },
  },
  { timestamps: true },
);

const borrowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['Borrowed', 'Returned', 'Overdue'], default: 'Borrowed' },
  },
  { timestamps: true },
);

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  { timestamps: true },
);
favoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // info | success | warning
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const activityLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, default: '' },
    action: { type: String, required: true }, // CREATE_BOOK | UPDATE_BOOK | DELETE_BOOK | CREATE_USER | DELETE_USER | etc.
    target: { type: String, default: '' }, // book title or user name
    details: { type: String, default: '' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const BorrowRecord = mongoose.model('BorrowRecord', borrowSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_BOOKS = [
  { bookId: 1, title: 'Java Programming', author: 'Liam Carter', category: 'Programming', rating: 4.8, availability: 'Available', description: 'A comprehensive guide to Java programming from basics to advanced concepts including OOP, data structures, and design patterns.', pages: 520, year: 2023, isbn: '978-0-13-468599-1', cover: 'https://images.unsplash.com/photo-1516979187454-437ec7d8d4b8?auto=format&fit=crop&w=600&q=80' },
  { bookId: 2, title: 'Python Fundamentals', author: 'Maya Brooks', category: 'Python', rating: 4.9, availability: 'Available', description: 'Master Python from scratch. Covers syntax, file handling, APIs, and real-world projects for beginners and intermediate developers.', pages: 460, year: 2024, isbn: '978-1-59327-584-6', cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
  { bookId: 3, title: 'Artificial Intelligence', author: 'Noah Green', category: 'AI', rating: 4.7, availability: 'Available', description: 'Explore the foundations of AI including search algorithms, knowledge representation, machine perception, and neural networks.', pages: 610, year: 2023, isbn: '978-0-13-604259-4', cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
  { bookId: 4, title: 'Machine Learning', author: 'Olivia Reed', category: 'ML', rating: 4.9, availability: 'Available', description: 'Hands-on guide to machine learning algorithms, model evaluation, feature engineering, and deployment using Python and scikit-learn.', pages: 580, year: 2024, isbn: '978-1-491-96229-6', cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80' },
  { bookId: 5, title: 'Web Development', author: 'Ethan Cole', category: 'Frontend', rating: 4.6, availability: 'Available', description: 'Full-stack web development covering HTML, CSS, JavaScript, React, Node.js, and deployment on cloud platforms.', pages: 495, year: 2023, isbn: '978-0-13-397884-7', cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80' },
  { bookId: 6, title: 'Database Management', author: 'Sophia Lee', category: 'Databases', rating: 4.8, availability: 'Available', description: 'In-depth coverage of relational databases, SQL, indexing, transactions, normalization, and NoSQL systems like MongoDB.', pages: 430, year: 2022, isbn: '978-0-07-802216-5', cover: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80' },
  { bookId: 7, title: 'Data Structures & Algorithms', author: 'James Walker', category: 'CS Fundamentals', rating: 4.9, availability: 'Available', description: 'Comprehensive guide to arrays, linked lists, trees, graphs, sorting, and searching algorithms with time complexity analysis.', pages: 540, year: 2023, isbn: '978-0-13-231216-5', cover: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=600&q=80' },
  { bookId: 8, title: 'Cloud Computing', author: 'Ava Mitchell', category: 'Cloud', rating: 4.6, availability: 'Available', description: 'Master AWS, Azure, and Google Cloud. Covers cloud architecture, microservices, serverless computing, and DevOps practices.', pages: 480, year: 2024, isbn: '978-1-491-96492-4', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
  { bookId: 9, title: 'Cybersecurity Essentials', author: 'Lucas Bennett', category: 'Security', rating: 4.7, availability: 'Available', description: 'Essential guide to network security, ethical hacking, cryptography, vulnerability assessment, and incident response.', pages: 510, year: 2023, isbn: '978-1-119-56209-6', cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80' },
  { bookId: 10, title: 'React & Next.js', author: 'Emma Johnson', category: 'Frontend', rating: 4.8, availability: 'Available', description: 'Build modern, performant web apps with React hooks, context, server-side rendering, and the Next.js App Router.', pages: 420, year: 2024, isbn: '978-1-801-81151-9', cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80' },
  { bookId: 11, title: 'Deep Learning', author: 'Oliver Harris', category: 'AI', rating: 4.9, availability: 'Available', description: 'Practical deep learning with TensorFlow and PyTorch. Covers CNNs, RNNs, transformers, and generative AI models.', pages: 600, year: 2024, isbn: '978-0-262-03561-3', cover: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=600&q=80' },
  { bookId: 12, title: 'Operating Systems', author: 'Isabella Clark', category: 'CS Fundamentals', rating: 4.5, availability: 'Available', description: 'Covers processes, threads, memory management, file systems, I/O, and virtualization with practical Unix/Linux examples.', pages: 565, year: 2022, isbn: '978-0-13-359162-0', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
  { bookId: 13, title: 'Computer Networks', author: 'William Turner', category: 'Networking', rating: 4.6, availability: 'Available', description: 'Thorough introduction to TCP/IP, HTTP, DNS, routing protocols, network security, and modern 5G architecture.', pages: 490, year: 2023, isbn: '978-0-13-359107-1', cover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80' },
  { bookId: 14, title: 'Software Engineering', author: 'Charlotte White', category: 'Engineering', rating: 4.7, availability: 'Available', description: 'Agile methodologies, design patterns, UML, software architecture, testing strategies, and project management techniques.', pages: 440, year: 2023, isbn: '978-0-13-207036-9', cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80' },
  { bookId: 15, title: 'DevOps & CI/CD', author: 'Henry Thompson', category: 'DevOps', rating: 4.8, availability: 'Available', description: 'End-to-end DevOps with Docker, Kubernetes, Jenkins, GitHub Actions, and infrastructure-as-code using Terraform.', pages: 460, year: 2024, isbn: '978-1-098-10850-3', cover: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80' },
  { bookId: 16, title: 'Natural Language Processing', author: 'Mia Anderson', category: 'AI', rating: 4.7, availability: 'Available', description: 'Tokenization, embeddings, transformer models, BERT, GPT, and building practical NLP pipelines with Hugging Face.', pages: 530, year: 2024, isbn: '978-1-098-13661-2', cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80' },
  { bookId: 17, title: 'Mobile App Development', author: 'Benjamin Martin', category: 'Mobile', rating: 4.6, availability: 'Available', description: 'Cross-platform mobile development with React Native and Flutter. Build, test, and publish iOS and Android apps.', pages: 475, year: 2023, isbn: '978-1-617-29536-5', cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80' },
  { bookId: 18, title: 'Blockchain Technology', author: 'Amelia Robinson', category: 'Emerging Tech', rating: 4.5, availability: 'Available', description: 'Distributed ledger technology, smart contracts with Solidity, DeFi, NFTs, and enterprise blockchain solutions.', pages: 390, year: 2023, isbn: '978-1-098-11037-7', cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80' },
  { bookId: 19, title: 'Statistics for Data Science', author: 'Daniel Lewis', category: 'Data Science', rating: 4.8, availability: 'Available', description: 'Probability theory, hypothesis testing, regression, Bayesian inference, and statistical modeling with Python and R.', pages: 510, year: 2022, isbn: '978-1-491-95291-4', cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
  { bookId: 20, title: 'System Design', author: 'Grace Hall', category: 'Engineering', rating: 4.9, availability: 'Available', description: 'Design scalable systems: load balancing, caching, databases, message queues, microservices, and API design.', pages: 445, year: 2024, isbn: '978-1-098-11347-7', cover: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=600&q=80' },
];

async function seedBooks() {
  const count = await Book.countDocuments();
  if (count === 0) {
    await Book.insertMany(SEED_BOOKS);
    console.log(`✅ Seeded ${SEED_BOOKS.length} books into the database.`);
  }
}

async function seedAdmin() {
  const adminEmail = 'prasad1@gmail.com';
  const adminPassword = 'pr@sad123';
  const desiredHash = hashPassword(adminPassword);

  const existing = await User.findOne({
    $or: [
      { email: adminEmail },
      { email: 'admin@library.com' },
      { isAdmin: true },
    ],
  });

  if (!existing) {
    await User.create({
      fullName: 'prasad bhadrashette',
      email: adminEmail,
      passwordHash: desiredHash,
      isAdmin: true,
      gender: 'Male',
      college: 'HUMAM Digital Library',
    });
    console.log(`✅ Admin user seeded: ${adminEmail} / ${adminPassword}`);
    return;
  }

  const shouldUpdate =
    existing.email !== adminEmail ||
    existing.passwordHash !== desiredHash ||
    existing.fullName !== 'prasad bhadrashette' ||
    existing.isAdmin !== true ||
    existing.college !== 'HUMAM Digital Library';

  if (shouldUpdate) {
    existing.fullName = 'prasad bhadrashette';
    existing.email = adminEmail;
    existing.passwordHash = desiredHash;
    existing.isAdmin = true;
    existing.gender = 'Male';
    existing.college = 'HUMAM Digital Library';
    await existing.save();
    console.log(`✅ Admin credentials synchronized: ${adminEmail} / ${adminPassword}`);
    return;
  }

  console.log(`✅ Admin user ready: ${adminEmail}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function logActivity(adminId, adminName, action, target, details = '') {
  try {
    await ActivityLog.create({ adminId, adminName, action, target, details });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Gemini error:', err.message);
    return null;
  }
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    college: user.college,
    course: user.course,
    academicYear: user.academicYear,
    address: user.address,
    profilePhoto: user.profilePhoto,
    isAdmin: user.isAdmin || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeBook(book) {
  return {
    id: book._id.toString(),
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    category: book.category,
    rating: book.rating,
    availability: book.availability,
    description: book.description,
    pages: book.pages,
    year: book.year,
    isbn: book.isbn,
    cover: book.cover,
  };
}

function getUserId(request) {
  return request.header('x-user-id');
}

async function requireAdmin(request, response, next) {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Authentication required.' });
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) return response.status(403).json({ message: 'Admin access required.' });
    request.adminUser = user;
    next();
  } catch {
    return response.status(403).json({ message: 'Admin access denied.' });
  }
}

async function addNotification(userId, message, type = 'info') {
  try {
    await Notification.create({ userId, message, type });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (request, response) => {
  try {
    const { fullName, email, password, confirmPassword, ...profile } = request.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!fullName?.trim() || !normalizedEmail || !password) {
      return response.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return response.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      ...profile,
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    });

    // Welcome notification
    await addNotification(user._id, `Welcome to Lumen Library, ${user.fullName}! Your account has been created.`, 'success');

    return response.status(201).json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error('Registration error:', error);
    return response.status(500).json({ message: 'Unable to create the account.' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user || user.passwordHash !== hashPassword(String(request.body.password || ''))) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    return response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return response.status(500).json({ message: 'Unable to log in right now.' });
  }
});

app.get('/api/auth/me', async (request, response) => {
  try {
    const user = await User.findById(getUserId(request));
    if (!user) {
      return response.status(401).json({ success: false, message: 'Session expired.' });
    }
    return response.json({ success: true, user: serializeUser(user) });
  } catch {
    return response.status(401).json({ success: false, message: 'Session expired.' });
  }
});

app.post('/api/auth/send-otp', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase();
    if (!email) return response.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return response.status(404).json({ message: 'No account found with that email address.' });

    const code = generateOtp();
    otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
    console.log(`\n🔑 OTP for ${email}: ${code}  (valid 10 min)\n`);

    return response.json({ success: true, message: `OTP sent to ${email}. Check the server console.` });
  } catch (error) {
    console.error('Send OTP error:', error);
    return response.status(500).json({ message: 'Unable to send OTP. Please try again.' });
  }
});

app.post('/api/auth/verify-otp', (request, response) => {
  const email = String(request.body.email || '').trim().toLowerCase();
  const otp = String(request.body.otp || '').trim();
  const record = otpStore.get(email);

  if (!record) return response.status(400).json({ message: 'No OTP was requested for this email.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return response.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.code !== otp) return response.status(400).json({ message: 'Incorrect OTP. Please check and try again.' });

  otpStore.delete(email);
  return response.json({ success: true, message: 'OTP verified.' });
});

app.post('/api/auth/reset-password', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase();
    const newPassword = String(request.body.newPassword || '');

    if (!email || !newPassword) return response.status(400).json({ message: 'Email and new password are required.' });
    if (newPassword.length < 6) return response.status(400).json({ message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ email });
    if (!user) return response.status(404).json({ message: 'No account found with that email address.' });

    user.passwordHash = hashPassword(newPassword);
    await user.save();
    return response.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return response.status(500).json({ message: 'Unable to reset password. Please try again.' });
  }
});

app.put('/api/auth/profile', async (request, response) => {
  try {
    const userId = getUserId(request);
    const updates = { ...request.body };
    delete updates.id;
    delete updates.password;
    delete updates.passwordHash;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (updates.email) updates.email = updates.email.trim().toLowerCase();
    if (updates.fullName) updates.fullName = updates.fullName.trim();

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) return response.status(404).json({ message: 'User account could not be found.' });

    return response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'An account with this email already exists.' });
    console.error('Profile update error:', error);
    return response.status(500).json({ message: 'Unable to update your profile.' });
  }
});

// ─── Books Routes ─────────────────────────────────────────────────────────────

app.get('/api/books', async (request, response) => {
  try {
    const books = await Book.find().sort({ bookId: 1 });
    return response.json({ success: true, books: books.map(serializeBook) });
  } catch (error) {
    console.error('Get books error:', error);
    return response.status(500).json({ message: 'Unable to fetch books.' });
  }
});

app.get('/api/books/:id', async (request, response) => {
  try {
    // Support lookup by either MongoDB _id or numeric bookId
    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findById(request.params.id);
    }
    if (!book) {
      book = await Book.findOne({ bookId: Number(request.params.id) });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });
    return response.json({ success: true, book: serializeBook(book) });
  } catch (error) {
    console.error('Get book error:', error);
    return response.status(500).json({ message: 'Unable to fetch the book.' });
  }
});

// ─── Borrow Routes ────────────────────────────────────────────────────────────

app.post('/api/books/:id/borrow', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in to borrow books.' });

    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findById(request.params.id);
    }
    if (!book) {
      book = await Book.findOne({ bookId: Number(request.params.id) });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });

    if (book.availability !== 'Available') {
      return response.status(400).json({ message: `This book is currently ${book.availability} and cannot be borrowed.` });
    }

    // Check if user already has an active borrow for this book
    const existingBorrow = await BorrowRecord.findOne({ userId, bookId: book._id, status: 'Borrowed' });
    if (existingBorrow) {
      return response.status(400).json({ message: 'You have already borrowed this book.' });
    }

    // Due date = 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const record = await BorrowRecord.create({ userId, bookId: book._id, dueDate });
    book.availability = 'Borrowed';
    await book.save();

    await addNotification(userId, `You have successfully borrowed "${book.title}". Due date: ${dueDate.toLocaleDateString()}.`, 'success');

    return response.status(201).json({
      success: true,
      message: `"${book.title}" borrowed successfully! Due date: ${dueDate.toLocaleDateString()}.`,
      record: {
        id: record._id.toString(),
        bookId: book._id.toString(),
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        status: record.status,
      },
    });
  } catch (error) {
    console.error('Borrow error:', error);
    return response.status(500).json({ message: 'Unable to borrow this book.' });
  }
});

app.get('/api/my-books', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in to view your books.' });

    const records = await BorrowRecord.find({ userId })
      .populate('bookId')
      .sort({ createdAt: -1 });

    const books = records
      .filter((r) => r.bookId) // guard against deleted books
      .map((r) => ({
        recordId: r._id.toString(),
        book: serializeBook(r.bookId),
        borrowDate: r.borrowDate,
        dueDate: r.dueDate,
        returnDate: r.returnDate,
        status: r.status,
      }));

    return response.json({ success: true, books });
  } catch (error) {
    console.error('My books error:', error);
    return response.status(500).json({ message: 'Unable to fetch your books.' });
  }
});

app.put('/api/my-books/:id/return', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in to return books.' });

    const record = await BorrowRecord.findOne({ _id: request.params.id, userId }).populate('bookId');
    if (!record) return response.status(404).json({ message: 'Borrow record not found.' });
    if (record.status === 'Returned') return response.status(400).json({ message: 'This book has already been returned.' });

    record.status = 'Returned';
    record.returnDate = new Date();
    await record.save();

    // Make book available again
    if (record.bookId) {
      record.bookId.availability = 'Available';
      await record.bookId.save();
    }

    await addNotification(userId, `You have returned "${record.bookId?.title || 'the book'}". Thank you!`, 'info');

    return response.json({ success: true, message: 'Book returned successfully.' });
  } catch (error) {
    console.error('Return error:', error);
    return response.status(500).json({ message: 'Unable to return this book.' });
  }
});

// ─── Favorites Routes ─────────────────────────────────────────────────────────

app.post('/api/books/:id/favorite', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in to add favorites.' });

    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findById(request.params.id);
    }
    if (!book) {
      book = await Book.findOne({ bookId: Number(request.params.id) });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });

    const existing = await Favorite.findOne({ userId, bookId: book._id });
    if (existing) return response.status(400).json({ message: 'This book is already in your favorites.' });

    await Favorite.create({ userId, bookId: book._id });
    await addNotification(userId, `"${book.title}" has been added to your favorites.`, 'info');

    return response.status(201).json({ success: true, message: `"${book.title}" added to favorites!` });
  } catch (error) {
    console.error('Add favorite error:', error);
    return response.status(500).json({ message: 'Unable to add to favorites.' });
  }
});

app.delete('/api/books/:id/favorite', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in.' });

    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findById(request.params.id);
    }
    if (!book) {
      book = await Book.findOne({ bookId: Number(request.params.id) });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });

    await Favorite.findOneAndDelete({ userId, bookId: book._id });
    return response.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return response.status(500).json({ message: 'Unable to remove from favorites.' });
  }
});

app.get('/api/favorites', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in.' });

    const favorites = await Favorite.find({ userId }).populate('bookId').sort({ createdAt: -1 });
    const books = favorites
      .filter((f) => f.bookId)
      .map((f) => ({
        favoriteId: f._id.toString(),
        book: serializeBook(f.bookId),
        addedAt: f.createdAt,
      }));

    return response.json({ success: true, books });
  } catch (error) {
    console.error('Get favorites error:', error);
    return response.status(500).json({ message: 'Unable to fetch favorites.' });
  }
});

// ─── Notifications Routes ─────────────────────────────────────────────────────

app.get('/api/notifications', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in.' });

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return response.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return response.status(500).json({ message: 'Unable to fetch notifications.' });
  }
});

app.put('/api/notifications/:id/read', async (request, response) => {
  try {
    const userId = getUserId(request);
    await Notification.findOneAndUpdate({ _id: request.params.id, userId }, { read: true });
    return response.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return response.status(500).json({ message: 'Unable to update notification.' });
  }
});

app.put('/api/notifications/read-all', async (request, response) => {
  try {
    const userId = getUserId(request);
    if (!userId) return response.status(401).json({ message: 'Please log in.' });
    await Notification.updateMany({ userId, read: false }, { read: true });
    return response.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return response.status(500).json({ message: 'Unable to update notifications.' });
  }
});

// ─── Admin Routes ──────────────────────────────────────────────────────────────

// Stats / Analytics
app.get('/api/admin/stats', requireAdmin, async (request, response) => {
  try {
    const [totalBooks, totalUsers, totalBorrows, activeBorrows, returnedBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      BorrowRecord.countDocuments(),
      BorrowRecord.countDocuments({ status: 'Borrowed' }),
      BorrowRecord.countDocuments({ status: 'Returned' }),
    ]);

    // Overdue: borrowed and past due date
    const now = new Date();
    const overdue = await BorrowRecord.countDocuments({ status: 'Borrowed', dueDate: { $lt: now } });

    // Category distribution
    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Monthly borrows for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const monthlyBorrows = await BorrowRecord.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top borrowed books
    const topBooks = await BorrowRecord.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', author: '$book.author', count: 1 } },
    ]);

    return response.json({
      success: true,
      stats: { totalBooks, totalUsers, totalBorrows, activeBorrows, returnedBorrows, overdue },
      categoryStats: categoryStats.map((c) => ({ category: c._id, count: c.count })),
      monthlyBorrows: monthlyBorrows.map((m) => ({
        label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        count: m.count,
      })),
      topBooks,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return response.status(500).json({ message: 'Unable to fetch stats.' });
  }
});

// ─── Admin: Users CRUD ────────────────────────────────────────────────────────

app.get('/api/admin/users', requireAdmin, async (request, response) => {
  try {
    const { search = '', page = 1, limit = 20 } = request.query;
    const query = search
      ? { $or: [{ fullName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await User.countDocuments(query);

    // Enrich with borrow counts
    const enriched = await Promise.all(
      users.map(async (u) => {
        const borrowCount = await BorrowRecord.countDocuments({ userId: u._id });
        const activeCount = await BorrowRecord.countDocuments({ userId: u._id, status: 'Borrowed' });
        return { ...serializeUser(u), borrowCount, activeCount };
      }),
    );

    return response.json({ success: true, users: enriched, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Admin users error:', error);
    return response.status(500).json({ message: 'Unable to fetch users.' });
  }
});

app.post('/api/admin/users', requireAdmin, async (request, response) => {
  try {
    const { fullName, email, password, isAdmin: adminFlag, ...rest } = request.body;
    if (!fullName?.trim() || !email || !password) {
      return response.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return response.status(409).json({ message: 'Email already in use.' });

    const user = await User.create({
      ...rest,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      isAdmin: adminFlag || false,
    });

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'CREATE_USER', user.fullName, `Email: ${user.email}`);
    return response.status(201).json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error('Admin create user error:', error);
    return response.status(500).json({ message: 'Unable to create user.' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (request, response) => {
  try {
    const updates = { ...request.body };
    delete updates.passwordHash;
    if (updates.password) {
      updates.passwordHash = hashPassword(updates.password);
      delete updates.password;
    }
    if (updates.email) updates.email = updates.email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(request.params.id, updates, { new: true, runValidators: true });
    if (!user) return response.status(404).json({ message: 'User not found.' });

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'UPDATE_USER', user.fullName, JSON.stringify(Object.keys(updates)));
    return response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'Email already in use.' });
    console.error('Admin update user error:', error);
    return response.status(500).json({ message: 'Unable to update user.' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (request, response) => {
  try {
    if (request.params.id === request.adminUser._id.toString()) {
      return response.status(400).json({ message: 'You cannot delete your own admin account.' });
    }
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) return response.status(404).json({ message: 'User not found.' });

    // Clean up user data
    await Promise.all([
      BorrowRecord.deleteMany({ userId: request.params.id }),
      Favorite.deleteMany({ userId: request.params.id }),
      Notification.deleteMany({ userId: request.params.id }),
    ]);

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'DELETE_USER', user.fullName, `Email: ${user.email}`);
    return response.json({ success: true, message: `User "${user.fullName}" deleted.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return response.status(500).json({ message: 'Unable to delete user.' });
  }
});

// ─── Admin: Books CRUD ────────────────────────────────────────────────────────

app.post('/api/admin/books', requireAdmin, async (request, response) => {
  try {
    const { title, author, category, description, pages, year, isbn, cover, rating, availability } = request.body;
    if (!title?.trim() || !author?.trim() || !category) {
      return response.status(400).json({ message: 'Title, author, and category are required.' });
    }

    // Auto-assign bookId
    const lastBook = await Book.findOne().sort({ bookId: -1 });
    const bookId = (lastBook?.bookId || 0) + 1;

    const book = await Book.create({
      bookId, title: title.trim(), author: author.trim(), category,
      description: description || '', pages: Number(pages) || 0,
      year: Number(year) || new Date().getFullYear(),
      isbn: isbn || '', cover: cover || '',
      rating: Number(rating) || 4.5,
      availability: availability || 'Available',
    });

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'CREATE_BOOK', book.title, `Author: ${book.author}, Category: ${book.category}`);
    return response.status(201).json({ success: true, book: serializeBook(book) });
  } catch (error) {
    console.error('Admin create book error:', error);
    return response.status(500).json({ message: 'Unable to create book.' });
  }
});

app.put('/api/admin/books/:id', requireAdmin, async (request, response) => {
  try {
    const updates = { ...request.body };
    delete updates.bookId; // prevent changing bookId
    if (updates.pages) updates.pages = Number(updates.pages);
    if (updates.year) updates.year = Number(updates.year);
    if (updates.rating) updates.rating = Number(updates.rating);

    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findByIdAndUpdate(request.params.id, updates, { new: true, runValidators: true });
    }
    if (!book) {
      book = await Book.findOneAndUpdate({ bookId: Number(request.params.id) }, updates, { new: true, runValidators: true });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'UPDATE_BOOK', book.title, JSON.stringify(Object.keys(updates)));
    return response.json({ success: true, book: serializeBook(book) });
  } catch (error) {
    console.error('Admin update book error:', error);
    return response.status(500).json({ message: 'Unable to update book.' });
  }
});

app.delete('/api/admin/books/:id', requireAdmin, async (request, response) => {
  try {
    let book;
    if (mongoose.Types.ObjectId.isValid(request.params.id)) {
      book = await Book.findByIdAndDelete(request.params.id);
    }
    if (!book) {
      book = await Book.findOneAndDelete({ bookId: Number(request.params.id) });
    }
    if (!book) return response.status(404).json({ message: 'Book not found.' });

    // Clean up borrow records and favorites for deleted book
    await Promise.all([
      BorrowRecord.deleteMany({ bookId: book._id }),
      Favorite.deleteMany({ bookId: book._id }),
    ]);

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'DELETE_BOOK', book.title, `Category: ${book.category}`);
    return response.json({ success: true, message: `Book "${book.title}" deleted.` });
  } catch (error) {
    console.error('Admin delete book error:', error);
    return response.status(500).json({ message: 'Unable to delete book.' });
  }
});

// ─── Admin: Borrow Records ────────────────────────────────────────────────────

app.get('/api/admin/borrow-records', requireAdmin, async (request, response) => {
  try {
    const { status, page = 1, limit = 20, search = '' } = request.query;
    const query = {};
    if (status) query.status = status;

    // Auto-mark overdue
    await BorrowRecord.updateMany(
      { status: 'Borrowed', dueDate: { $lt: new Date() } },
      { status: 'Overdue' },
    );

    let records = await BorrowRecord.find(query)
      .populate('userId', 'fullName email')
      .populate('bookId', 'title author category')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    if (search) {
      records = records.filter(
        (r) =>
          r.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          r.bookId?.title?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const total = await BorrowRecord.countDocuments(query);

    const serialized = records.map((r) => ({
      id: r._id.toString(),
      user: r.userId ? { id: r.userId._id.toString(), fullName: r.userId.fullName, email: r.userId.email } : null,
      book: r.bookId ? { id: r.bookId._id.toString(), title: r.bookId.title, author: r.bookId.author, category: r.bookId.category } : null,
      borrowDate: r.borrowDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      status: r.status,
    }));

    return response.json({ success: true, records: serialized, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Admin borrow records error:', error);
    return response.status(500).json({ message: 'Unable to fetch borrow records.' });
  }
});

app.put('/api/admin/borrow-records/:id/return', requireAdmin, async (request, response) => {
  try {
    const record = await BorrowRecord.findById(request.params.id).populate('bookId');
    if (!record) return response.status(404).json({ message: 'Record not found.' });
    if (record.status === 'Returned') return response.status(400).json({ message: 'Already returned.' });

    record.status = 'Returned';
    record.returnDate = new Date();
    await record.save();

    if (record.bookId) {
      record.bookId.availability = 'Available';
      await record.bookId.save();
    }

    await logActivity(request.adminUser._id, request.adminUser.fullName, 'ADMIN_RETURN', record.bookId?.title || 'Unknown Book', `Record ID: ${record._id}`);
    return response.json({ success: true, message: 'Book marked as returned.' });
  } catch (error) {
    console.error('Admin return error:', error);
    return response.status(500).json({ message: 'Unable to update record.' });
  }
});

// ─── Admin: Activity Logs ─────────────────────────────────────────────────────

app.get('/api/admin/activity-logs', requireAdmin, async (request, response) => {
  try {
    const { page = 1, limit = 30 } = request.query;
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await ActivityLog.countDocuments();

    return response.json({
      success: true,
      logs: logs.map((l) => ({
        id: l._id.toString(),
        adminName: l.adminName,
        action: l.action,
        target: l.target,
        details: l.details,
        createdAt: l.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error('Activity logs error:', error);
    return response.status(500).json({ message: 'Unable to fetch activity logs.' });
  }
});

// ─── Admin: AI Features ───────────────────────────────────────────────────────

app.post('/api/admin/ai/generate-description', requireAdmin, async (request, response) => {
  try {
    const { title, author, category, pages, year } = request.body;
    if (!title) return response.status(400).json({ message: 'Book title is required.' });

    const prompt = `You are a professional librarian. Write a compelling 2-3 sentence book description for a library catalog.

Book details:
- Title: "${title}"
- Author: ${author || 'Unknown'}
- Category: ${category || 'General'}
- Pages: ${pages || 'Unknown'}
- Year: ${year || 'Unknown'}

Write only the description text, no labels or prefixes. Make it informative, engaging, and suitable for students and learners.`;

    const text = await callGemini(prompt);
    if (!text) {
      return response.status(503).json({ message: 'AI service unavailable. Please add GEMINI_API_KEY to .env file.' });
    }
    return response.json({ success: true, description: text.trim() });
  } catch (error) {
    console.error('AI generate description error:', error);
    return response.status(500).json({ message: 'Unable to generate description.' });
  }
});

app.post('/api/admin/ai/recommend-category', requireAdmin, async (request, response) => {
  try {
    const { title, author, description } = request.body;
    if (!title) return response.status(400).json({ message: 'Title is required.' });

    const categories = ['Programming', 'Python', 'AI', 'ML', 'Frontend', 'Databases', 'CS Fundamentals', 'Cloud', 'Security', 'DevOps', 'Mobile', 'Networking', 'Engineering', 'Data Science', 'Emerging Tech'];

    const prompt = `Based on the following book details, recommend the BEST category from this list: ${categories.join(', ')}.

Book Title: "${title}"
Author: ${author || 'Unknown'}
Description: ${description || 'Not provided'}

Respond with ONLY the category name from the list above, nothing else.`;

    const text = await callGemini(prompt);
    if (!text) {
      return response.status(503).json({ message: 'AI service unavailable.' });
    }

    const suggested = text.trim().replace(/[^a-zA-Z\s&]/g, '').trim();
    const matched = categories.find((c) => c.toLowerCase() === suggested.toLowerCase()) || suggested;
    return response.json({ success: true, category: matched });
  } catch (error) {
    console.error('AI recommend category error:', error);
    return response.status(500).json({ message: 'Unable to recommend category.' });
  }
});

app.post('/api/admin/ai/chat', requireAdmin, async (request, response) => {
  try {
    const { message, history = [] } = request.body;
    if (!message?.trim()) return response.status(400).json({ message: 'Message is required.' });

    // Gather live stats for context
    const [totalBooks, totalUsers, activeBorrows, overdue] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      BorrowRecord.countDocuments({ status: 'Borrowed' }),
      BorrowRecord.countDocuments({ status: 'Borrowed', dueDate: { $lt: new Date() } }),
    ]);

    const systemContext = `You are an AI assistant for the HUMAM Digital Library admin panel. You help administrators manage the library system.

Current Library Statistics:
- Total Books: ${totalBooks}
- Total Users: ${totalUsers}
- Active Borrows: ${activeBorrows}
- Overdue Books: ${overdue}

You can answer questions about library management, book recommendations, user management policies, and general library best practices. Keep responses concise and helpful.`;

    const historyText = history.map((h) => `${h.role === 'user' ? 'Admin' : 'Assistant'}: ${h.content}`).join('\n');
    const fullPrompt = `${systemContext}\n\nConversation:\n${historyText}\nAdmin: ${message}\nAssistant:`;

    const text = await callGemini(fullPrompt);
    if (!text) {
      return response.status(503).json({ message: 'AI service unavailable. Please add GEMINI_API_KEY to your .env file.' });
    }
    return response.json({ success: true, reply: text.trim() });
  } catch (error) {
    console.error('AI chat error:', error);
    return response.status(500).json({ message: 'Unable to process AI request.' });
  }
});

app.get('/api/admin/ai/insights', requireAdmin, async (request, response) => {
  try {
    const [totalBooks, totalUsers, activeBorrows, overdue, returnedCount] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      BorrowRecord.countDocuments({ status: 'Borrowed' }),
      BorrowRecord.countDocuments({ status: 'Borrowed', dueDate: { $lt: new Date() } }),
      BorrowRecord.countDocuments({ status: 'Returned' }),
    ]);

    const topCategory = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const prompt = `You are an AI library analyst. Generate a brief, insightful health report (3-4 sentences) for a digital library based on these statistics:

- Total Books in Catalog: ${totalBooks}
- Registered Students: ${totalUsers}
- Books Currently Borrowed: ${activeBorrows}
- Overdue Returns: ${overdue}
- Books Successfully Returned: ${returnedCount}
- Most Popular Category: ${topCategory[0]?._id || 'N/A'} (${topCategory[0]?.count || 0} books)

Provide actionable insights and highlight any concerns. Be concise and professional.`;

    const text = await callGemini(prompt);
    if (!text) {
      return response.json({
        success: true,
        insights: `The library currently has ${totalBooks} books with ${activeBorrows} active borrows and ${overdue} overdue items. ${overdue > 0 ? 'Follow up with members who have overdue books.' : 'Great job keeping overdue books at bay!'}`,
        aiGenerated: false,
      });
    }
    return response.json({ success: true, insights: text.trim(), aiGenerated: true });
  } catch (error) {
    console.error('AI insights error:', error);
    return response.status(500).json({ message: 'Unable to generate insights.' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    await seedBooks();
    await seedAdmin();
    app.listen(PORT, () => console.log(`✅ Lumen API running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed. Check MONGODB_URI and Atlas network access.');
    console.error(error.message);
    process.exit(1);
  });

