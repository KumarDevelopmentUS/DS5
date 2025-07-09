// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Storage Utilities
 *
 * A set of utilities for interacting with the device's local storage.
 * This is essential for caching data, persisting user settings, and
 * implementing offline support.
 *
 * Features:
 * - AsyncStorage for general data caching
 * - SecureStore for sensitive data
 * - Offline action queue management
 * - Type-safe storage operations
 * - Error handling and recovery
 * - Cache expiration support
 */

// Storage keys with prefixes for organization
const STORAGE_KEYS = {
  // User preferences
  THEME_PREFERENCE: 'app:theme_preference',
  USER_SETTINGS: 'app:user_settings',

  // Cache keys
  CACHE_PREFIX: 'cache:',
  USER_DATA_PREFIX: 'user_data:',

  // Offline support
  OFFLINE_QUEUE: 'offline:action_queue',

  // Auth tokens (stored in SecureStore)
  ACCESS_TOKEN: 'secure:access_token',
  REFRESH_TOKEN: 'secure:refresh_token',
} as const;

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

// Offline action interface
export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Store JSON data in AsyncStorage
 *
 * @param key - Storage key
 * @param data - Data to store (will be JSON stringified)
 * @returns Promise<boolean> - Success status
 */
export const cacheData = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`, jsonData);
    return true;
  } catch (error) {
    console.error(`Error caching data for key "${key}":`, error);
    return false;
  }
};

/**
 * Retrieve JSON data from AsyncStorage
 *
 * @param key - Storage key
 * @returns Promise<T | null> - Retrieved data or null if not found
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.CACHE_PREFIX}${key}`
    );

    if (jsonData === null) {
      return null;
    }

    return JSON.parse(jsonData) as T;
  } catch (error) {
    console.error(`Error retrieving cached data for key "${key}":`, error);
    return null;
  }
};

/**
 * Store data with expiration (TTL - Time To Live)
 *
 * @param key - Storage key
 * @param data - Data to store
 * @param ttl - Time to live in milliseconds (optional)
 * @returns Promise<boolean> - Success status
 */
export const cacheDataWithTTL = async <T>(
  key: string,
  data: T,
  ttl?: number
): Promise<boolean> => {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    const jsonData = JSON.stringify(cacheEntry);
    await AsyncStorage.setItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`, jsonData);
    return true;
  } catch (error) {
    console.error(`Error caching data with TTL for key "${key}":`, error);
    return false;
  }
};

/**
 * Retrieve data with expiration check
 *
 * @param key - Storage key
 * @returns Promise<T | null> - Retrieved data or null if expired/not found
 */
export const getCachedDataWithTTL = async <T>(
  key: string
): Promise<T | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.CACHE_PREFIX}${key}`
    );

    if (jsonData === null) {
      return null;
    }

    const cacheEntry: CacheEntry<T> = JSON.parse(jsonData);
    const now = Date.now();

    // Check if data has expired
    if (cacheEntry.ttl && now - cacheEntry.timestamp > cacheEntry.ttl) {
      // Remove expired data
      await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.error(
      `Error retrieving cached data with TTL for key "${key}":`,
      error
    );
    return null;
  }
};

/**
 * Remove cached data
 *
 * @param key - Storage key
 * @returns Promise<boolean> - Success status
 */
export const removeCachedData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing cached data for key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all cached data
 *
 * @returns Promise<boolean> - Success status
 */
export const clearAllCache = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) =>
      key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }

    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

/**
 * Store sensitive data in SecureStore
 *
 * @param key - Storage key
 * @param value - Value to store securely
 * @returns Promise<boolean> - Success status
 */
export const storeSecureData = async (
  key: string,
  value: string
): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error(`Error storing secure data for key "${key}":`, error);
    return false;
  }
};

/**
 * Retrieve sensitive data from SecureStore
 *
 * @param key - Storage key
 * @returns Promise<string | null> - Retrieved data or null if not found
 */
export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving secure data for key "${key}":`, error);
    return null;
  }
};

/**
 * Remove sensitive data from SecureStore
 *
 * @param key - Storage key
 * @returns Promise<boolean> - Success status
 */
export const removeSecureData = async (key: string): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`Error removing secure data for key "${key}":`, error);
    return false;
  }
};

/**
 * Store user settings (theme, notifications, etc.)
 *
 * @param settings - User settings object
 * @returns Promise<boolean> - Success status
 */
export const storeUserSettings = async (
  settings: Record<string, any>
): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, jsonData);
    return true;
  } catch (error) {
    console.error('Error storing user settings:', error);
    return false;
  }
};

/**
 * Retrieve user settings
 *
 * @returns Promise<Record<string, any> | null> - User settings or null
 */
export const getUserSettings = async (): Promise<Record<
  string,
  any
> | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);

    if (jsonData === null) {
      return null;
    }

    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error retrieving user settings:', error);
    return null;
  }
};

/**
 * Add an action to the offline queue
 *
 * Saves an action to be synced when the network is available
 *
 * @param action - Action to queue
 * @returns Promise<boolean> - Success status
 */
export const queueOfflineAction = async (
  action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
): Promise<boolean> => {
  try {
    const existingQueue = await getOfflineQueue();

    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const updatedQueue = [...existingQueue, newAction];
    const jsonData = JSON.stringify(updatedQueue);

    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, jsonData);
    return true;
  } catch (error) {
    console.error('Error queuing offline action:', error);
    return false;
  }
};

/**
 * Get all queued offline actions
 *
 * @returns Promise<OfflineAction[]> - Array of queued actions
 */
export const getOfflineQueue = async (): Promise<OfflineAction[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);

    if (jsonData === null) {
      return [];
    }

    return JSON.parse(jsonData) as OfflineAction[];
  } catch (error) {
    console.error('Error retrieving offline queue:', error);
    return [];
  }
};

/**
 * Remove an action from the offline queue
 *
 * @param actionId - ID of the action to remove
 * @returns Promise<boolean> - Success status
 */
export const removeOfflineAction = async (
  actionId: string
): Promise<boolean> => {
  try {
    const queue = await getOfflineQueue();
    const updatedQueue = queue.filter((action) => action.id !== actionId);

    const jsonData = JSON.stringify(updatedQueue);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, jsonData);
    return true;
  } catch (error) {
    console.error('Error removing offline action:', error);
    return false;
  }
};

/**
 * Clear all queued offline actions
 *
 * @returns Promise<boolean> - Success status
 */
export const clearOfflineQueue = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return true;
  } catch (error) {
    console.error('Error clearing offline queue:', error);
    return false;
  }
};

/**
 * Increment retry count for an offline action
 *
 * @param actionId - ID of the action
 * @returns Promise<boolean> - Success status
 */
export const incrementActionRetryCount = async (
  actionId: string
): Promise<boolean> => {
  try {
    const queue = await getOfflineQueue();
    const updatedQueue = queue.map((action) => {
      if (action.id === actionId) {
        return { ...action, retryCount: action.retryCount + 1 };
      }
      return action;
    });

    const jsonData = JSON.stringify(updatedQueue);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, jsonData);
    return true;
  } catch (error) {
    console.error('Error incrementing action retry count:', error);
    return false;
  }
};

/**
 * Get storage info for debugging
 *
 * @returns Promise<object> - Storage statistics
 */
export const getStorageInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) =>
      key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
    );
    const userDataKeys = keys.filter((key) =>
      key.startsWith(STORAGE_KEYS.USER_DATA_PREFIX)
    );

    return {
      totalKeys: keys.length,
      cacheKeys: cacheKeys.length,
      userDataKeys: userDataKeys.length,
      offlineQueueSize: (await getOfflineQueue()).length,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalKeys: 0,
      cacheKeys: 0,
      userDataKeys: 0,
      offlineQueueSize: 0,
    };
  }
};

// Export storage keys for use in other files
export { STORAGE_KEYS };
