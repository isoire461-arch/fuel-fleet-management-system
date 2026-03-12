import React from 'react';
import { useAuth } from '../services/authContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that protects routes by requiring authentication.
 * If user is not authenticated, shows fallback content (typically a login screen).
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthGuard;
