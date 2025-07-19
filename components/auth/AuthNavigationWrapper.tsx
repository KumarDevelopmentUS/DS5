// components/auth/AuthNavigationWrapper.tsx
import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';

interface AuthNavigationWrapperProps {
  children: React.ReactNode;
}

/**
 * This component handles automatic navigation based on authentication state.
 * It should wrap your entire app layout.
 * 
 * Guest users can access the home page and most features.
 * Only redirects to auth when explicitly needed (e.g., accessing protected features).
 */
export const AuthNavigationWrapper: React.FC<AuthNavigationWrapperProps> = ({
  children,
}) => {
  const { isAuthenticated, initializing } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Don't do anything while initializing
    if (initializing) return;

    // Check if we're in an auth route (login, signup, forgotpassword, etc.)
    const authRoutes = ['login', 'signup', 'forgotpassword'];
    const currentRoute = segments[segments.length - 1]; // Get the last segment (current route)
    const inAuthGroup = authRoutes.includes(currentRoute);

    // Only redirect authenticated users away from auth routes
    if (isAuthenticated && inAuthGroup) {
      // User is authenticated but still in auth routes, redirect to main app
      router.replace('/(tabs)/home');
    }
    
    // Note: We no longer redirect unauthenticated users to login
    // They can access the home page as guests
  }, [isAuthenticated, initializing, segments]);

  return <>{children}</>;
};

export default AuthNavigationWrapper;
