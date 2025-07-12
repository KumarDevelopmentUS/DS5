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

    console.log('Navigation check:', {
      isAuthenticated,
      inAuthGroup,
      currentRoute,
      segments,
      initializing,
    });

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth routes, redirect to login
      console.log('Redirecting to login...');
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but still in auth routes, redirect to main app
      console.log('Redirecting to main app...');
      router.replace('/(tabs)/home'); // Replace with your main app route
    }
  }, [isAuthenticated, initializing, segments]);

  return <>{children}</>;
};

export default AuthNavigationWrapper;
