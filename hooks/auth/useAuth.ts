// hooks/auth/useAuth.ts
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Custom Hook: useAuth
 *
 * Purpose:
 * This hook provides a clean and reusable interface for components to access
 * authentication state (like user, session, and profile) and methods
 * (like signIn, signOut). It acts as a simplified facade over the
 * underlying AuthContext.
 *
 * Why it's used:
 * - To avoid components needing to import `useContext` and `AuthContext` directly.
 * - To provide a single, consistent entry point for all auth-related logic.
 * - To make components cleaner and more focused on their own responsibilities.
 *
 * Critical Details:
 * - It calls the `useAuthContext` hook, which handles the actual logic of
 * retrieving the context value.
 * - It ensures that any component using this hook is a child of `AuthProvider`,
 * throwing an error otherwise.
 * - It returns the entire context value, which includes the derived `isAuthenticated`
 * boolean, loading states, and all authentication methods.
 */
export const useAuth = () => {
  // useAuthContext already finds the context and throws an error if it's not available.
  const context = useAuthContext();

  // The context object already contains all the necessary state and methods,
  // including the `isAuthenticated` boolean. We can return it directly.
  return context;
};
