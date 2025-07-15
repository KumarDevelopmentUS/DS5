// hooks/ui/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 *
 * This hook delays the update of a value until after a specified delay period
 * has passed since the last time the value changed. This is useful for
 * optimizing performance in scenarios like search input where you don't want
 * to trigger API calls on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * // Use debouncedSearchTerm in your API calls
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if the value changes before the delay has passed
    // This ensures that the debounced value is only updated after the user
    // has stopped changing the value for the specified delay period
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing callbacks
 *
 * This hook returns a debounced version of a callback function.
 * The callback will only be executed after the specified delay
 * has passed since the last time it was called.
 *
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @param deps - Dependencies for the callback (similar to useCallback)
 * @returns The debounced callback function
 *
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   searchAPI(query);
 * }, 300, []);
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  deps: React.DependencyList = []
): T => {
  const [debouncedCallback, setDebouncedCallback] = useState<T | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(timer);
      setDebouncedCallback(null);
    };
  }, [callback, delay, ...deps]);

  // Return a function that calls the debounced callback if it exists
  return ((...args: Parameters<T>) => {
    if (debouncedCallback) {
      return debouncedCallback(...args);
    }
  }) as T;
};

/**
 * Custom hook for debouncing with immediate execution option
 *
 * This hook provides more control over the debouncing behavior,
 * allowing for immediate execution on the leading edge of the delay.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to execute on the leading edge (default: false)
 * @returns Object containing the debounced value and loading state
 *
 * @example
 * const { debouncedValue, isDebouncing } = useAdvancedDebounce(
 *   searchTerm,
 *   300,
 *   false
 * );
 */
export const useAdvancedDebounce = <T>(
  value: T,
  delay: number,
  immediate: boolean = false
): {
  debouncedValue: T;
  isDebouncing: boolean;
} => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    // If immediate is true, execute on the leading edge
    if (immediate && debouncedValue === value) {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [value, delay, immediate]);

  return {
    debouncedValue,
    isDebouncing,
  };
};

export default useDebounce;
