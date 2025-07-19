// hooks/auth/useAuth.ts
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Authentication Hook
 * 
 * Provides access to authentication state and methods throughout the application.
 * Acts as a facade over the AuthContext for cleaner component integration.
 */
export const useAuth = () => {
  // useAuthContext already finds the context and throws an error if it's not available.
  const context = useAuthContext();

  // The context object already contains all the necessary state and methods,
  // including the `isAuthenticated` boolean. We can return it directly.
  return context;
};
