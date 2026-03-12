import { useEffect } from 'react';
import { useAuth } from './authContext';

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_WARNING_MS = 23 * 60 * 60 * 1000; // 23 hours

/**
 * Hook for monitoring session expiration and auto-logout
 */
export const useSessionTimeout = () => {
  const { logout, authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const checkExpiration = () => {
      try {
        const expiresAt = localStorage.getItem('fuel_fleet_auth_expires');
        if (!expiresAt) return;

        const expirationTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const timeLeft = expirationTime - now;

        // Auto logout if expired
        if (timeLeft <= 0) {
          logout();
          return;
        }

        // Warn user if 30 minutes left
        if (timeLeft <= 30 * 60 * 1000 && timeLeft > 29 * 60 * 1000) {
          // You can dispatch an event or show a notification here
          window.dispatchEvent(
            new CustomEvent('auth:sessionWarning', {
              detail: { timeLeft },
            })
          );
        }
      } catch (error) {
        console.warn('Error checking session expiration:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, [authToken, logout]);
};

/**
 * Check if authentication token is valid and not expired
 */
export const isTokenValid = (): boolean => {
  try {
    const token = localStorage.getItem('fuel_fleet_auth_token');
    const expiresAt = localStorage.getItem('fuel_fleet_auth_expires');

    if (!token || !expiresAt) {
      return false;
    }

    const expirationTime = new Date(expiresAt).getTime();
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
};

/**
 * Get remaining session time in milliseconds
 */
export const getSessionTimeRemaining = (): number => {
  try {
    const expiresAt = localStorage.getItem('fuel_fleet_auth_expires');
    if (!expiresAt) return 0;

    const expirationTime = new Date(expiresAt).getTime();
    const timeLeft = expirationTime - Date.now();
    return Math.max(0, timeLeft);
  } catch {
    return 0;
  }
};

/**
 * Format remaining session time for display
 */
export const formatSessionTimeRemaining = (): string => {
  const ms = getSessionTimeRemaining();
  if (ms <= 0) return 'Expired';

  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};

/**
 * Refresh the session (extend expiration time)
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    // In a real app, you would call a refresh endpoint
    // For now, we just extend the current session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    localStorage.setItem('fuel_fleet_auth_expires', expiresAt.toISOString());
    window.dispatchEvent(new Event('auth:sessionRefreshed'));
    return true;
  } catch {
    return false;
  }
};
