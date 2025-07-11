import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Default Auth Route
 *
 * This component serves as the entry point for the /(auth) route group.
 * It uses a programmatic redirect to navigate the user to the login screen,
 * ensuring that there's no blank page if a user lands on the base auth route.
 */
const AuthIndex = () => {
  const router = useRouter();

  useEffect(() => {
    // Programmatically redirect to the login screen.
    // 'replace' is used to prevent the user from navigating back to this empty screen.
    router.replace('../(auth)/login');
  }, [router]);

  // This component renders nothing, as it redirects immediately.
  return null;
};

export default AuthIndex;
