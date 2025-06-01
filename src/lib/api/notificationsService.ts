
import apiClient from './axiosConfig';

export interface NotificationSetting {
  email_alerts: boolean;
  sms_alerts: boolean;
  push_alerts: boolean;
  whatsapp_alerts: boolean;
  alert_frequency: 'immediately' | 'hourly' | 'daily';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: 'alert' | 'system' | 'subscription';
  alert_id?: string;
  read: boolean;
  created_at: string;
}

export const notificationsService = {
  getSettings: async (): Promise<NotificationSetting> => {
    try {
      const response = await apiClient.get('/notification-settings/my_settings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  updateSettings: async (settings: Partial<NotificationSetting>): Promise<NotificationSetting> => {
    try {
      const response = await apiClient.put('/notification-settings/update_settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get('/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get('/notifications/unread/');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.post(`/notifications/${notificationId}/mark_read/`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.post('/notifications/mark_all_read/');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
};
