import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '../services/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Run on mount to check if user has a stored token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('research_pilot_token');
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Fetch current user details with token
        const response = await api.get('/auth/me');
        setState({
          user: response.data.user,
          token: token,
          isAuthenticated: true,
          loading: false,
        });
      } catch (err: any) {
        console.error('[Auth Provider] Token validation failed on boot:', err.message);
        localStorage.removeItem('research_pilot_token');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('research_pilot_token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Invalid email or password';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('research_pilot_token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('research_pilot_token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
