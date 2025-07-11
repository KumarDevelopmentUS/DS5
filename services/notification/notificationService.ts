// services/notification/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../database/databaseService';
import type { TableInsert } from '../database/databaseService';
import { NOTIFICATION_CONFIG } from '../../constants/config';
import { ApiResponse, ErrorCodes } from '../../types/api';
import { Notification, NotificationData } from '../../types/models';
import { NotificationType } from '../../types/enums';
import { createErrorHandler } from '../../utils/errors';

/**
 * Notification Service
 *
 * Manages the registration of devices for push notifications and the sending of
 * both push and in-app notifications. It interacts with Expo Push Notifications
 * and the Supabase database.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SendPushNotificationData {
  recipientId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: NotificationData;
}

export interface NotificationServiceResponse<T = any> extends ApiResponse<T> {}

const handleError = createErrorHandler(
  'NotificationService',
  'notification_operations'
);

// ============================================
// SERVICE CLASS
// ============================================

export class NotificationService {
  /**
   * Registers the device's push token with the user's profile.
   * @param userId - The ID of the user to register the token for.
   * @returns A success or error response.
   */
  static async registerForPushNotifications(
    userId: string
  ): Promise<NotificationServiceResponse<{ token: string | null }>> {
    try {
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return {
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Failed to get push token for push notification!',
          },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) throw error;

      return {
        success: true,
        data: { token },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'registerForPushNotifications',
        userId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Sends a push notification to a specific user.
   * NOTE: In a production app, this logic should live on a secure server.
   * @param data - The data for the push notification.
   * @returns A success or error response.
   */
  static async sendPushNotification(
    data: SendPushNotificationData
  ): Promise<NotificationServiceResponse<null>> {
    const { recipientId, title, body, data: notificationData } = data;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', recipientId)
        .single();

      if (profileError || !profile?.push_token) {
        return {
          success: false,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Recipient push token not found.',
          },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      const message = {
        to: profile.push_token,
        sound: 'default',
        title,
        body,
        data: notificationData,
      };

      await fetch(NOTIFICATION_CONFIG.EXPO_PUSH_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'sendPushNotification',
        ...data,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Creates an in-app notification record in the database.
   * @param data - The data for the new notification.
   * @returns The created notification.
   */
  static async createNotification(
    data: CreateNotificationData
  ): Promise<NotificationServiceResponse<Notification>> {
    try {
      const notificationData: TableInsert<'notifications'> = {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
      };

      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select('*')
        .single();

      if (error) throw error;

      return {
        success: true,
        // FIX: Use the transform function to map DB fields to model fields
        data: this.transformNotification(newNotification),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'createNotification',
        ...data,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Transforms a raw database notification into a structured Notification object.
   * @param dbNotification - The raw notification row from Supabase.
   * @returns A structured Notification object.
   */
  private static transformNotification(dbNotification: any): Notification {
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
  }
}

// ============================================
// EXPORTED INSTANCE
// ============================================

export const notificationService = {
  registerForPushNotifications:
    NotificationService.registerForPushNotifications,
  sendPushNotification: NotificationService.sendPushNotification,
  createNotification: NotificationService.createNotification,
};
