// hooks/ui/useRefresh.ts
import { useState, useCallback } from 'react';

/**
 * The callback function to be executed when a refresh is triggered.
 * It is expected to return a promise that resolves when the refresh action is complete.
 */
type RefreshCallback = () => Promise<any>;

/**
 * The return type for the useRefresh hook.
 */
interface UseRefreshResult {
  isRefreshing: boolean;
  handleRefresh: () => void;
}

/**
 * A utility hook to simplify the implementation of "pull-to-refresh" functionality on lists.
 * It manages the loading state for the refresh action.
 *
 * @param onRefresh - The function to call when a refresh is initiated. This function should
 * return a promise that resolves once the data has been refreshed.
 * @returns An object containing the `isRefreshing` state and a `handleRefresh` function
 * to be passed to the RefreshControl component.
 */
export const useRefresh = (onRefresh: RefreshCallback): UseRefreshResult => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * A memoized callback to handle the refresh logic.
   * It sets the refreshing state, calls the provided onRefresh function,
   * and then resets the state, ensuring the UI updates correctly.
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Wait for the refresh operation to complete.
      await onRefresh();
    } catch (error) {
      // Log any errors that occur during the refresh process.
      console.error('Error during refresh:', error);
    } finally {
      // Ensure the refreshing state is always reset, even if an error occurs.
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return { isRefreshing, handleRefresh };
};
