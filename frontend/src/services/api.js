const API_BASE = 'http://localhost:5000/api';

// Store current user ID in session storage for headers
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

export const libraryBooks = [
  {
    id: 1,
    title: 'Java Programming',
    author: 'Liam Carter',
    category: 'Programming',
    rating: 4.8,
    availability: 'Available',
    cover:
      'https://images.unsplash.com/photo-1516979187454-437ec7d8d4b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Python Fundamentals',
    author: 'Maya Brooks',
    category: 'Python',
    rating: 4.9,
    availability: 'Borrowed',
    cover:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Artificial Intelligence',
    author: 'Noah Green',
    category: 'AI',
    rating: 4.7,
    availability: 'Available',
    cover:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Machine Learning',
    author: 'Olivia Reed',
    category: 'ML',
    rating: 4.9,
    availability: 'Reserved',
    cover:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Web Development',
    author: 'Ethan Cole',
    category: 'Frontend',
    rating: 4.6,
    availability: 'Available',
    cover:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Database Management',
    author: 'Sophia Lee',
    category: 'Databases',
    rating: 4.8,
    availability: 'Available',
    cover:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
  },
];

export const libraryFeatures = [
  {
    title: 'Digital Library Overview',
    description: 'Browse curated academic collections, digital archives, and online reading spaces from one place.',
    icon: 'LibraryBig',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Reading Resources',
    description: 'Access chapter notes, e-books, and guided study sections designed for academic learning.',
    icon: 'BookText',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Study Resources',
    description: 'Track your learning path with practice tests, digital references, and reading schedules.',
    icon: 'GraduationCap',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Online Access',
    description: 'Read anywhere on mobile, tablet, or desktop with synchronized personal profiles and progress.',
    icon: 'MonitorSmartphone',
    image:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
  },
];

export const recentActivities = [
  'Registered library account',
  'Borrowed Java Programming',
  'Added Machine Learning to favorites',
  'Completed Artificial Intelligence chapter',
  'Updated profile',
];

export async function registerUser(payload) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Registration failed.' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
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

    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed.' };
    }

    // Store user ID for session
    setUserId(data.user.id);

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function getCurrentUser() {
  try {
    const userId = getUserId();

    if (!userId) {
      return null;
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
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
  if (user && user.id) {
    setUserId(user.id);
  }
}

export async function updateUser(userId, updates) {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Profile update failed.' };
    }

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

    if (!response.ok) {
      return { success: false, message: data.message || 'Password reset failed.' };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export function clearCurrentUser() {
  setUserId(null);
}
