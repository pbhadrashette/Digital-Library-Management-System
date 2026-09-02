import { createContext, useContext, useEffect, useState } from 'react';
import { clearCurrentUser, getCurrentUser, loginUser, registerUser, setCurrentUser, updateUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(getCurrentUser()).then((currentUser) => {
      if (currentUser) setUser(currentUser);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const result = await loginUser(email, password);

    if (!result.success) {
      return result;
    }

    setUser(result.user);
    setCurrentUser(result.user);
    return result;
  };

  const register = async (payload) => {
    const result = await registerUser(payload);

    if (!result.success) {
      return result;
    }

    return result;
  };

  const updateProfile = async (updates) => {
    if (!user?.id) {
      return { success: false, message: 'Please log in again to update your profile.' };
    }

    const result = await updateUser(user.id, updates);

    if (result.success) {
      setUser(result.user);
    }

    return result;
  };

  const logout = () => {
    setUser(null);
    clearCurrentUser();
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    register,
    updateProfile,
  };

  if (loading) {
    return null; // or a spinner — wait for session restore before rendering
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
