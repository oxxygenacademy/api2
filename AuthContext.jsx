import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // تحديث الطريق الصحيح
  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // استخدام الطريق الصحيح
      const response = await axios.get('http://localhost:3000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // حذف التوكن إذا كان غير صالح
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        phone,
        password,
      });

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.user;
        const tokenOnly = newToken.replace('Bearer ', ''); // إزالة Bearer إذا كان موجود
        
        localStorage.setItem('token', tokenOnly);
        setToken(tokenOnly);
        setUser(userData);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (phone, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        phone,
        password,
      });

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.user;
        const tokenOnly = newToken.replace('Bearer ', ''); // إزالة Bearer إذا كان موجود
        
        localStorage.setItem('token', tokenOnly);
        setToken(tokenOnly);
        setUser(userData);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};