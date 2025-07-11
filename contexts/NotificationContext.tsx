// contexts/NotificationContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { NOTIFICATION_CONFIG } from '../constants/config';
import { ApiError } from '../types/api';
import { NotificationType } from '../types/enums';
import { Notification, NotificationData } from '../types/models';
import { createErrorHandler } from '../utils/errors';
import { cacheDataWithTTL, getCachedDataWithTTL } from '../utils/storage';
import { notificationService } from '../services/notification/notificationService';
import { supabase } from '../services/database/databaseService';

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: ApiError | null;
  lastFetch: string | null;
  userId: string | null;
}

export interface NotificationContextValue {
  // State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: ApiError | null;

  // Actions
  showNotification: (
    type: NotificationType,
    title: string,
    message?: string,
    data?: NotificationData
  ) => void;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => Promise<void>;

  // Utility
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
}

// Action types for reducer
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | {
      type: 'UPDATE_NOTIFICATION';
      payload: { id: string; updates: Partial<Notification> };
    }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_UNREAD_COUNT' }
  | { type: 'SET_USER_ID'; payload: string | null };

// Storage keys
const STORAGE_KEYS = {
  NOTIFICATIONS: 'notifications_cache',
  LAST_FETCH: 'notifications_last_fetch',
} as const;

// Cache TTL (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// ============================================
// REDUCER
// ============================================

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_USER_ID':
      return {
        ...state,
        userId: action.payload,
      };

    case 'SET_NOTIFICATIONS': {
      const notifications = action.payload;
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        ...state,
        notifications,
        unreadCount,
        loading: false,
        error: null,
        lastFetch: new Date().toISOString(),
      };
    }

    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;

      // Prevent duplicates
      const exists = state.notifications.some(
        (n) => n.id === newNotification.id
      );
      if (exists) {
        return state;
      }

      // Add to beginning of list (most recent first)
      const notifications = [newNotification, ...state.notifications];

      // Limit total notifications to prevent memory issues
      const limitedNotifications = notifications.slice(
        0,
        NOTIFICATION_CONFIG.MAX_IN_APP_NOTIFICATIONS
      );

      const unreadCount = limitedNotifications.filter((n) => !n.isRead).length;

      return {
        ...state,
        notifications: limitedNotifications,
        unreadCount,
      };
    }

    case 'UPDATE_NOTIFICATION': {
      const { id, updates } = action.payload;
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      );

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        ...state,
        notifications,
        unreadCount,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        ...state,
        notifications,
        unreadCount,
      };
    }

    case 'MARK_AS_READ': {
      const notifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        ...state,
        notifications,
        unreadCount,
      };
    }

    case 'MARK_ALL_AS_READ': {
      const notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      return {
        ...state,
        notifications,
        unreadCount: 0,
      };
    }

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case 'UPDATE_UNREAD_COUNT': {
      const unreadCount = state.notifications.filter((n) => !n.isRead).length;
      return {
        ...state,
        unreadCount,
      };
    }

    default:
      return state;
  }
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetch: null,
  userId: null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transforms database notification to app notification model
 */
const transformNotification = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id,
    userId: dbNotification.user_id,
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    data: dbNotification.data || {},
    isRead: dbNotification.is_read || false,
    createdAt: new Date(dbNotification.created_at),
  };
};

// ============================================
// CONTEXT CREATION
// ============================================

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Error handler for this component
  const handleError = createErrorHandler(
    'NotificationContext',
    'notification_management'
  );

  // ============================================
  // AUTH STATE MANAGEMENT
  // ============================================

  // Get current user and listen for auth changes
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      dispatch({ type: 'SET_USER_ID', payload: user?.id || null });
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        dispatch({ type: 'SET_USER_ID', payload: session?.user?.id || null });
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  // Load notifications from cache on mount
  useEffect(() => {
    const loadCachedNotifications = async () => {
      try {
        const cachedNotifications = await getCachedDataWithTTL<Notification[]>(
          STORAGE_KEYS.NOTIFICATIONS
        );

        if (cachedNotifications && Array.isArray(cachedNotifications)) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: cachedNotifications });
        }
      } catch (error) {
        handleError(error, { action: 'load_cached_notifications' });
      }
    };

    loadCachedNotifications();
  }, []);

  // Cache notifications whenever they change
  useEffect(() => {
    if (state.notifications.length > 0) {
      cacheDataWithTTL(
        STORAGE_KEYS.NOTIFICATIONS,
        state.notifications,
        CACHE_TTL
      ).catch((error) => {
        handleError(error, { action: 'cache_notifications' });
      });
    }
  }, [state.notifications]);

  // ============================================
  // NOTIFICATION ACTIONS
  // ============================================

  const showNotification = useCallback(
    async (
      type: NotificationType,
      title: string,
      message?: string,
      data: NotificationData = {}
    ) => {
      try {
        if (!state.userId) {
          console.warn('Cannot create notification: No user logged in');
          return;
        }

        // Create notification on server
        const response = await notificationService.createNotification({
          userId: state.userId,
          type,
          title,
          message,
          data,
        });

        if (response.success && response.data) {
          dispatch({ type: 'ADD_NOTIFICATION', payload: response.data });
        } else {
          // If server creation fails, still show local notification
          const localNotification: Notification = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: state.userId,
            type,
            title,
            message,
            data,
            isRead: false,
            createdAt: new Date(),
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: localNotification });
        }
      } catch (error) {
        handleError(error, {
          action: 'show_notification',
          notificationType: type,
          title,
        });
      }
    },
    [state.userId, handleError]
  );

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        // Optimistic update
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });

        // Update on server
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) throw error;

        return true;
      } catch (error) {
        handleError(error, {
          action: 'mark_as_read',
          notificationId,
        });

        // Revert optimistic update on error
        dispatch({
          type: 'UPDATE_NOTIFICATION',
          payload: { id: notificationId, updates: { isRead: false } },
        });

        return false;
      }
    },
    [handleError]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const unreadNotifications = state.notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) {
        return true;
      }

      // Optimistic update
      dispatch({ type: 'MARK_ALL_AS_READ' });

      // Update all unread notifications on server
      const unreadIds = unreadNotifications.map((n) => n.id);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      return true;
    } catch (error) {
      handleError(error, { action: 'mark_all_as_read' });

      // Revert optimistic update on error
      refreshNotifications();

      return false;
    }
  }, [state.notifications, handleError]);

  const removeNotification = useCallback(
    async (notificationId: string) => {
      try {
        // Optimistic update
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });

        // Delete from server
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;
      } catch (error) {
        handleError(error, {
          action: 'remove_notification',
          notificationId,
        });

        // Revert by refreshing notifications
        refreshNotifications();
      }
    },
    [handleError]
  );

  const clearAllNotifications = useCallback(async () => {
    try {
      if (!state.userId) {
        console.warn('Cannot clear notifications: No user logged in');
        return;
      }

      // Optimistic update
      dispatch({ type: 'CLEAR_ALL' });

      // Delete all user notifications from server
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', state.userId);

      if (error) throw error;
    } catch (error) {
      handleError(error, { action: 'clear_all_notifications' });

      // Revert by refreshing notifications
      refreshNotifications();
    }
  }, [state.userId, handleError]);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    try {
      if (!state.userId) {
        console.warn('Cannot refresh notifications: No user logged in');
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      // Fetch notifications from server
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', state.userId)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATION_CONFIG.MAX_IN_APP_NOTIFICATIONS);

      if (error) throw error;

      // Transform and set notifications
      const transformedNotifications = notifications.map(transformNotification);
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: transformedNotifications,
      });
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'refresh_notifications',
      });
      dispatch({ type: 'SET_ERROR', payload: parsedError });
    }
  }, [state.userId, handleError]);

  // ============================================
  // AUTO-REFRESH ON USER CHANGE
  // ============================================

  useEffect(() => {
    if (state.userId) {
      refreshNotifications();
    } else {
      // Clear notifications when user logs out
      dispatch({ type: 'CLEAR_ALL' });
    }
  }, [state.userId]);

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  useEffect(() => {
    if (!state.userId) return;

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          const newNotification = transformNotification(payload.new);
          dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          const updatedNotification = transformNotification(payload.new);
          dispatch({
            type: 'UPDATE_NOTIFICATION',
            payload: {
              id: updatedNotification.id,
              updates: updatedNotification,
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: payload.old.id });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.userId]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getUnreadNotifications = useCallback((): Notification[] => {
    return state.notifications.filter((notification) => !notification.isRead);
  }, [state.notifications]);

  const getNotificationsByType = useCallback(
    (type: NotificationType): Notification[] => {
      return state.notifications.filter(
        (notification) => notification.type === type
      );
    },
    [state.notifications]
  );

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: NotificationContextValue = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,

    // Actions
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refreshNotifications,

    // Utility
    getUnreadNotifications,
    getNotificationsByType,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================
// HOOK FOR CONSUMING CONTEXT
// ============================================

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }

  return context;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default NotificationProvider;
