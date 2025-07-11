// hooks/ui/useKeyboard.ts
import { useState, useEffect } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

// Define the structure of the object returned by the hook
export interface KeyboardInfo {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

/**
 * Custom Hook: useKeyboard
 *
 * Purpose:
 * Provides real-time information about the device's keyboard, including its
 * visibility and height. This is crucial for creating layouts that can
 * dynamically adjust to the keyboard, preventing UI elements like input
 * fields from being obscured.
 *
 * Why it's used:
 * - To create a smooth user experience on forms and text-heavy screens.
 * - To abstract away the complexity of keyboard event listeners.
 * - To provide a simple, reusable solution for keyboard awareness in any component.
 *
 * @returns An object containing `isKeyboardVisible` (boolean) and `keyboardHeight` (number).
 */
export const useKeyboard = (): KeyboardInfo => {
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    // Define the event names based on the platform
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    // Handler for when the keyboard appears
    const keyboardDidShow = (e: KeyboardEvent) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };

    // Handler for when the keyboard disappears
    const keyboardDidHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    // Add the event listeners
    const showSubscription = Keyboard.addListener(showEvent, keyboardDidShow);
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardDidHide);

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};
