// contexts/OfflineContext.tsx

import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { ApiError } from '../types/api';
import { createErrorHandler, logError } from '../utils/errors';
import {
  clearOfflineQueue,
  getOfflineQueue,
  incrementActionRetryCount,
  OfflineAction,
  queueOfflineAction,
  removeOfflineAction,
} from '../utils/storage';

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface NetworkInfo {
  type: NetInfoStateType;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  details: any;
}

export interface OfflineState {
  isOnline: boolean;
  networkInfo: NetworkInfo | null;
  offlineQueue: OfflineAction[];
  isSyncing: boolean;
  lastSyncAttempt: string | null;
  syncError: ApiError | null;
}

export interface OfflineContextValue {
  // Network Status
  isOnline: boolean;
  networkInfo: NetworkInfo | null;

  // Queue Management
  offlineQueue: OfflineAction[];
  queuedActionsCount: number;

  // Sync Status
  isSyncing: boolean;
  lastSyncAttempt: string | null;
  syncError: ApiError | null;

  // Actions
  queueAction: (
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
  ) => Promise<boolean>;
  syncQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  removeQueuedAction: (actionId: string) => Promise<boolean>;

  // Utilities
  isActionQueued: (actionType: string, payload?: any) => boolean;
  getQueuedActions: (actionType?: string) => OfflineAction[];
  canPerformAction: () => boolean;
}

// Action types for reducer
type OfflineAction_Reducer =
  | {
      type: 'SET_NETWORK_STATE';
      payload: { isOnline: boolean; networkInfo: NetworkInfo | null };
    }
  | { type: 'SET_OFFLINE_QUEUE'; payload: OfflineAction[] }
  | { type: 'ADD_TO_QUEUE'; payload: OfflineAction }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_SYNC_ERROR'; payload: ApiError | null }
  | { type: 'SET_LAST_SYNC_ATTEMPT'; payload: string }
  | { type: 'CLEAR_QUEUE' };

// ============================================
// REDUCER
// ============================================

const offlineReducer = (
  state: OfflineState,
  action: OfflineAction_Reducer
): OfflineState => {
  switch (action.type) {
    case 'SET_NETWORK_STATE':
      return {
        ...state,
        isOnline: action.payload.isOnline,
        networkInfo: action.payload.networkInfo,
      };

    case 'SET_OFFLINE_QUEUE':
      return {
        ...state,
        offlineQueue: action.payload,
      };

    case 'ADD_TO_QUEUE':
      // Prevent duplicate actions
      const exists = state.offlineQueue.some(
        (item) =>
          item.type === action.payload.type &&
          JSON.stringify(item.payload) ===
            JSON.stringify(action.payload.payload)
      );

      if (exists) {
        return state;
      }

      return {
        ...state,
        offlineQueue: [...state.offlineQueue, action.payload],
      };

    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        offlineQueue: state.offlineQueue.filter(
          (item) => item.id !== action.payload
        ),
      };

    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload,
      };

    case 'SET_SYNC_ERROR':
      return {
        ...state,
        syncError: action.payload,
        isSyncing: false,
      };

    case 'SET_LAST_SYNC_ATTEMPT':
      return {
        ...state,
        lastSyncAttempt: action.payload,
        syncError: null,
      };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        offlineQueue: [],
        syncError: null,
      };

    default:
      return state;
  }
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: OfflineState = {
  isOnline: true, // Assume online initially
  networkInfo: null,
  offlineQueue: [],
  isSyncing: false,
  lastSyncAttempt: null,
  syncError: null,
};

// ============================================
// CONTEXT CREATION
// ============================================

const OfflineContext = createContext<OfflineContextValue | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);
  const syncTimeoutRef = useRef<number | null>(null);

  // Error handler for this component
  const handleError = createErrorHandler(
    'OfflineContext',
    'offline_management'
  );

  // ============================================
  // NETWORK STATUS MONITORING
  // ============================================

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(
      (netInfoState: NetInfoState) => {
        const networkInfo: NetworkInfo = {
          type: netInfoState.type,
          isConnected: netInfoState.isConnected ?? false,
          isInternetReachable: netInfoState.isInternetReachable,
          details: netInfoState.details,
        };

        const isOnline =
          netInfoState.isConnected === true &&
          netInfoState.isInternetReachable !== false;

        dispatch({
          type: 'SET_NETWORK_STATE',
          payload: { isOnline, networkInfo },
        });

        // If we just came back online, trigger sync after a short delay
        if (isOnline && !state.isOnline && state.offlineQueue.length > 0) {
          // Clear any existing timeout
          if (syncTimeoutRef.current !== null) {
            clearTimeout(syncTimeoutRef.current);
          }

          // Schedule sync after 2 seconds to allow connection to stabilize
          syncTimeoutRef.current = setTimeout(() => {
            syncQueue();
          }, 2000);
        }
      }
    );

    // Get initial network state
    NetInfo.fetch().then((netInfoState: NetInfoState) => {
      const networkInfo: NetworkInfo = {
        type: netInfoState.type,
        isConnected: netInfoState.isConnected ?? false,
        isInternetReachable: netInfoState.isInternetReachable,
        details: netInfoState.details,
      };

      const isOnline =
        netInfoState.isConnected === true &&
        netInfoState.isInternetReachable !== false;

      dispatch({
        type: 'SET_NETWORK_STATE',
        payload: { isOnline, networkInfo },
      });
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
      if (syncTimeoutRef.current !== null) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state.isOnline, state.offlineQueue.length]);

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  // Load offline queue on mount
  useEffect(() => {
    const loadOfflineQueue = async () => {
      try {
        const queue = await getOfflineQueue();
        dispatch({ type: 'SET_OFFLINE_QUEUE', payload: queue });
      } catch (error) {
        handleError(error, { action: 'load_offline_queue' });
      }
    };

    loadOfflineQueue();
  }, []);

  const queueAction = useCallback(
    async (
      action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
    ): Promise<boolean> => {
      try {
        const success = await queueOfflineAction(action);

        if (success) {
          // Reload queue to get the new action with generated ID
          const updatedQueue = await getOfflineQueue();
          dispatch({ type: 'SET_OFFLINE_QUEUE', payload: updatedQueue });
        }

        return success;
      } catch (error) {
        handleError(error, {
          action: 'queue_action',
          actionType: action.type,
        });
        return false;
      }
    },
    [handleError]
  );

  const syncQueue = useCallback(async (): Promise<void> => {
    // Don't sync if offline or already syncing
    if (!state.isOnline || state.isSyncing) {
      return;
    }

    // Don't sync if queue is empty
    if (state.offlineQueue.length === 0) {
      return;
    }

    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      dispatch({
        type: 'SET_LAST_SYNC_ATTEMPT',
        payload: new Date().toISOString(),
      });

      const queue = await getOfflineQueue();
      const failedActions: string[] = [];

      // Process actions sequentially to maintain order
      for (const action of queue) {
        try {
          // TODO: Replace with actual service calls when services are available
          // This is where you'd call the appropriate service method based on action.type

          /*
          switch (action.type) {
            case 'CREATE_MATCH':
              await matchService.createMatch(action.payload);
              break;
            case 'UPDATE_PROFILE':
              await profileService.updateProfile(action.payload);
              break;
            case 'SEND_FRIEND_REQUEST':
              await friendService.sendRequest(action.payload);
              break;
            // Add more action types as needed
            default:
              console.warn('Unknown offline action type:', action.type);
          }
          */

          // For now, simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Remove successful action from queue
          await removeOfflineAction(action.id);
          dispatch({ type: 'REMOVE_FROM_QUEUE', payload: action.id });
        } catch (actionError) {
          // Handle individual action failure
          await incrementActionRetryCount(action.id);

          // If max retries exceeded, remove the action
          if (action.retryCount >= action.maxRetries) {
            await removeOfflineAction(action.id);
            dispatch({ type: 'REMOVE_FROM_QUEUE', payload: action.id });
            failedActions.push(action.id);

            logError(actionError, {
              action: 'sync_offline_action_max_retries',
              actionId: action.id,
              actionType: action.type,
            });
          } else {
            logError(actionError, {
              action: 'sync_offline_action_retry',
              actionId: action.id,
              actionType: action.type,
              retryCount: action.retryCount,
            });
          }
        }
      }

      // Update queue with any remaining actions
      const remainingQueue = await getOfflineQueue();
      dispatch({ type: 'SET_OFFLINE_QUEUE', payload: remainingQueue });

      dispatch({ type: 'SET_SYNCING', payload: false });

      // If there were failures, log them but don't show as error if some succeeded
      if (failedActions.length > 0 && failedActions.length < queue.length) {
        console.warn(
          `Sync completed with ${failedActions.length} failed actions`
        );
      }
    } catch (error) {
      const parsedError = handleError(error, { action: 'sync_offline_queue' });
      dispatch({ type: 'SET_SYNC_ERROR', payload: parsedError });
    }
  }, [state.isOnline, state.isSyncing, state.offlineQueue, handleError]);

  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      await clearOfflineQueue();
      dispatch({ type: 'CLEAR_QUEUE' });
    } catch (error) {
      handleError(error, { action: 'clear_offline_queue' });
    }
  }, [handleError]);

  const removeQueuedAction = useCallback(
    async (actionId: string): Promise<boolean> => {
      try {
        const success = await removeOfflineAction(actionId);

        if (success) {
          dispatch({ type: 'REMOVE_FROM_QUEUE', payload: actionId });
        }

        return success;
      } catch (error) {
        handleError(error, {
          action: 'remove_queued_action',
          actionId,
        });
        return false;
      }
    },
    [handleError]
  );

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const isActionQueued = useCallback(
    (actionType: string, payload?: any): boolean => {
      return state.offlineQueue.some((action) => {
        if (action.type !== actionType) return false;

        // If payload is provided, check for exact match
        if (payload !== undefined) {
          return JSON.stringify(action.payload) === JSON.stringify(payload);
        }

        return true;
      });
    },
    [state.offlineQueue]
  );

  const getQueuedActions = useCallback(
    (actionType?: string): OfflineAction[] => {
      if (actionType) {
        return state.offlineQueue.filter(
          (action) => action.type === actionType
        );
      }
      return state.offlineQueue;
    },
    [state.offlineQueue]
  );

  const canPerformAction = useCallback((): boolean => {
    // Can perform action if online, or if offline but action will be queued
    return state.isOnline || true; // Always allow actions (will queue if offline)
  }, [state.isOnline]);

  // ============================================
  // AUTO-SYNC SETUP
  // ============================================

  useEffect(() => {
    // Set up periodic sync attempts when online
    if (state.isOnline && state.offlineQueue.length > 0 && !state.isSyncing) {
      const interval = setInterval(() => {
        syncQueue();
      }, 30000); // Try to sync every 30 seconds

      return () => clearInterval(interval);
    }
  }, [state.isOnline, state.offlineQueue.length, state.isSyncing, syncQueue]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: OfflineContextValue = {
    // Network Status
    isOnline: state.isOnline,
    networkInfo: state.networkInfo,

    // Queue Management
    offlineQueue: state.offlineQueue,
    queuedActionsCount: state.offlineQueue.length,

    // Sync Status
    isSyncing: state.isSyncing,
    lastSyncAttempt: state.lastSyncAttempt,
    syncError: state.syncError,

    // Actions
    queueAction,
    syncQueue,
    clearQueue,
    removeQueuedAction,

    // Utilities
    isActionQueued,
    getQueuedActions,
    canPerformAction,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

// ============================================
// HOOK FOR CONSUMING CONTEXT
// ============================================

export const useOffline = (): OfflineContextValue => {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }

  return context;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default OfflineProvider;
