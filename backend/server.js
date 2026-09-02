import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lumen_library';

app.use(cors());
app.use(express.json());

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
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function getUserId(request) {
  return request.header('x-user-id');
}

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

app.post('/api/auth/reset-password', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase();
    const newPassword = String(request.body.newPassword || '');

    if (!email || !newPassword) {
      return response.status(400).json({ message: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return response.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).json({ message: 'No account found with that email address.' });
    }

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
    if (!user) {
      return response.status(404).json({ message: 'User account could not be found.' });
    }

    return response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Profile update error:', error);
    return response.status(500).json({ message: 'Unable to update your profile.' });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Lumen API running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error(`MongoDB connection failed for ${MONGODB_URI}`);
    console.error(error.message);
    process.exit(1);
  });
