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

  // التحقق من حالة تسجيل الدخول
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // إزالة التوكن إذا كان غير صالح
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // إزالة التوكن إذا كان هناك خطأ
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول
  const login = async (phone, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        phone,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        const token = userData.token.replace('Bearer ', ''); // إزالة Bearer prefix
        
        // حفظ التوكن
        localStorage.setItem('authToken', token);
        
        // تحديث حالة المستخدم
        setUser({
          id: userData.id,
          phone: userData.phone
        });

        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'فشل في تسجيل الدخول'
      };
    }
  };

  // تسجيل مستخدم جديد
  const register = async (phone, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        phone,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        const token = userData.token.replace('Bearer ', ''); // إزالة Bearer prefix
        
        // حفظ التوكن
        localStorage.setItem('authToken', token);
        
        // تحديث حالة المستخدم
        setUser({
          id: userData.id,
          phone: userData.phone
        });

        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'فشل في إنشاء الحساب'
      };
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // التحقق من الحالة عند تحميل التطبيق
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};