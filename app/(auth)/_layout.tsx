import { Stack } from 'expo-router';
import React from 'react';

/**
 * Auth Layout
 *
 * This component defines the navigation stack for the authentication group.
 * All screens within the /(auth) directory will be part of this stack.
 * It ensures that navigation between login, signup, etc., works correctly.
 */
export default function AuthLayout() {
  return (
    <Stack
      // Hide the header for all screens in the auth flow
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
