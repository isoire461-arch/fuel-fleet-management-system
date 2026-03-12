import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, setAuthToken, getAuthToken, clearAuthToken } from './apiService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, pin: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  authToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setLocalAuthToken] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for saved token
        const savedToken = localStorage.getItem('fuel_fleet_auth_token');
        const savedUser = localStorage.getItem('fuel_fleet_user');

        if (savedToken && savedUser) {
          setAuthToken(savedToken);
          setLocalAuthToken(savedToken);
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.warn('Failed to restore auth state:', error);
        // Clear invalid data
        localStorage.removeItem('fuel_fleet_auth_token');
        localStorage.removeItem('fuel_fleet_user');
      }
    };

    initializeAuth();
  }, []);

  const login = async (name: string, pin: string) => {
    setIsLoading(true);
    try {
      const response = await apiLogin({ name, pin });

      // Save token and user
      localStorage.setItem('fuel_fleet_auth_token', response.token);
      localStorage.setItem('fuel_fleet_auth_expires', response.expires_at);

      // Convert API user response to local User type
      const user: User = {
        id: response.user.id.toString(),
        name: response.user.name,
        role: response.user.role as any,
        email: `${response.user.name.toLowerCase().replace(/\s+/g, '.')}@fleet.local`, // placeholder email
        pin: pin, // Store pin locally for PIN validation
        photo: null,
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      };

      setAuthToken(response.token);
      setLocalAuthToken(response.token);
      setCurrentUser(user);
      localStorage.setItem('fuel_fleet_user', JSON.stringify(user));

      // Dispatch event for global listeners
      window.dispatchEvent(new Event('auth:changed'));
    } catch (error) {
      clearAuthToken();
      setLocalAuthToken(null);
      setCurrentUser(null);
      localStorage.removeItem('fuel_fleet_auth_token');
      localStorage.removeItem('fuel_fleet_user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setLocalAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('fuel_fleet_auth_token');
    localStorage.removeItem('fuel_fleet_auth_expires');
    localStorage.removeItem('fuel_fleet_user');
    window.dispatchEvent(new Event('auth:changed'));
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fuel_fleet_user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser && !!authToken,
    isLoading,
    login,
    logout,
    updateUser,
    authToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
