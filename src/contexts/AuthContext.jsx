import React, { createContext, useContext, useState, useEffect } from 'react';
import { logLoginAttempt, logSecurityEvent, logSecurityWarning } from '@/utils/securityLogger';
import { generateSessionId } from '@/utils/encryption';

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
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  const SESSION_TIMEOUT = parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000; // 1 hour
  const MAX_LOGIN_ATTEMPTS = parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5;

  useEffect(() => {
    // Check for existing session on mount
    checkExistingSession();
  }, []);

  useEffect(() => {
    // Set up session timeout
    if (user) {
      setupSessionTimeout();
    } else {
      clearSessionTimeout();
    }
  }, [user]);

  const checkExistingSession = () => {
    try {
      const sessionData = sessionStorage.getItem('userSession');
      const sessionId = sessionStorage.getItem('sessionId');
      
      if (sessionData && sessionId) {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session is still valid
        if (session.expiresAt > now) {
          setUser(session.user);
          logSecurityEvent('session_restored', { userId: session.user.id });
        } else {
          // Session expired
          clearSession();
          logSecurityWarning('session_expired', { userId: session.user.id });
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const setupSessionTimeout = () => {
    clearSessionTimeout();
    
    const timeoutId = setTimeout(() => {
      logout('session_timeout');
    }, SESSION_TIMEOUT);
    
    setSessionTimeout(timeoutId);
  };

  const clearSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      // Check login attempts
      const attempts = getLoginAttempts(email);
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Simulate API call
      const response = await mockLogin(email, password);
      
      if (response.success) {
        const sessionId = generateSessionId();
        const expiresAt = Date.now() + SESSION_TIMEOUT;
        
        const sessionData = {
          user: response.user,
          expiresAt,
          loginTime: Date.now()
        };

        // Store session data
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('userId', response.user.id);
        
        setUser(response.user);
        clearLoginAttempts(email);
        
        logLoginAttempt(email, true, {
          userId: response.user.id,
          sessionId,
          rememberMe
        });

        return { success: true, user: response.user };
      } else {
        incrementLoginAttempts(email);
        logLoginAttempt(email, false, { reason: response.error });
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      incrementLoginAttempts(email);
      logLoginAttempt(email, false, { error: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (reason = 'user_logout') => {
    const userId = user?.id;
    
    clearSession();
    setUser(null);
    
    logSecurityEvent('logout', { 
      userId, 
      reason,
      sessionDuration: getSessionDuration()
    });
  };

  const clearSession = () => {
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('userId');
    clearSessionTimeout();
  };

  const getSessionDuration = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('userSession') || '{}');
      if (sessionData.loginTime) {
        return Date.now() - sessionData.loginTime;
      }
    } catch (error) {
      console.error('Error calculating session duration:', error);
    }
    return 0;
  };

  const refreshSession = () => {
    if (user) {
      const sessionData = JSON.parse(sessionStorage.getItem('userSession') || '{}');
      sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
      sessionStorage.setItem('userSession', JSON.stringify(sessionData));
      
      setupSessionTimeout();
      logSecurityEvent('session_refreshed', { userId: user.id });
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'viewer': 1,
      'analyst': 2,
      'operator': 3,
      'admin': 4
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || user.role === 'admin';
  };

  // Helper functions for login attempts tracking
  const getLoginAttempts = (email) => {
    const attempts = localStorage.getItem(`login_attempts_${email}`);
    return attempts ? parseInt(attempts) : 0;
  };

  const incrementLoginAttempts = (email) => {
    const attempts = getLoginAttempts(email) + 1;
    localStorage.setItem(`login_attempts_${email}`, attempts.toString());
    
    // Clear attempts after 15 minutes
    setTimeout(() => {
      localStorage.removeItem(`login_attempts_${email}`);
    }, 15 * 60 * 1000);
  };

  const clearLoginAttempts = (email) => {
    localStorage.removeItem(`login_attempts_${email}`);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    refreshSession,
    hasRole,
    hasPermission,
    sessionTimeout: sessionTimeout ? SESSION_TIMEOUT : 0
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock login function - replace with actual API call
const mockLogin = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock users database
  const users = {
    'admin@company.com': {
      id: 'user_1',
      email: 'admin@company.com',
      name: 'System Administrator',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      avatar: null
    },
    'operator@company.com': {
      id: 'user_2',
      email: 'operator@company.com',
      name: 'Grid Operator',
      role: 'operator',
      permissions: ['read', 'write'],
      avatar: null
    },
    'analyst@company.com': {
      id: 'user_3',
      email: 'analyst@company.com',
      name: 'Data Analyst',
      role: 'analyst',
      permissions: ['read'],
      avatar: null
    }
  };

  const user = users[email];
  
  if (user && password === 'password123') {
    return { success: true, user };
  } else {
    return { success: false, error: 'Invalid email or password' };
  }
};