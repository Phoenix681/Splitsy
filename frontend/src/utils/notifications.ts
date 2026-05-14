/**
 * Notification utilities
 * Simple toast-like notifications for user feedback
 */

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Store notifications for display
let notifications: Notification[] = [];
let notificationListeners: ((notifications: Notification[]) => void)[] = [];

/**
 * Subscribe to notification updates
 */
export const subscribeToNotifications = (
  callback: (notifications: Notification[]) => void
) => {
  notificationListeners.push(callback);
};

/**
 * Unsubscribe from notification updates
 */
export const unsubscribeFromNotifications = (
  callback: (notifications: Notification[]) => void
) => {
  notificationListeners = notificationListeners.filter(cb => cb !== callback);
};

/**
 * Notify all subscribers
 */
const notifySubscribers = () => {
  notificationListeners.forEach(cb => cb([...notifications]));
};

/**
 * Show a success notification
 */
export const showSuccess = (message: string, duration = 3000) => {
  const id = Date.now().toString();
  const notification: Notification = {
    id,
    message,
    type: 'success',
    duration,
  };
  
  notifications.push(notification);
  notifySubscribers();

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
};

/**
 * Show an error notification
 */
export const showError = (message: string, duration = 4000) => {
  const id = Date.now().toString();
  const notification: Notification = {
    id,
    message,
    type: 'error',
    duration,
  };
  
  notifications.push(notification);
  notifySubscribers();

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
};

/**
 * Show an info notification
 */
export const showInfo = (message: string, duration = 3000) => {
  const id = Date.now().toString();
  const notification: Notification = {
    id,
    message,
    type: 'info',
    duration,
  };
  
  notifications.push(notification);
  notifySubscribers();

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
};

/**
 * Show a warning notification
 */
export const showWarning = (message: string, duration = 3000) => {
  const id = Date.now().toString();
  const notification: Notification = {
    id,
    message,
    type: 'warning',
    duration,
  };
  
  notifications.push(notification);
  notifySubscribers();

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
};

/**
 * Remove a notification
 */
export const removeNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  notifySubscribers();
};

/**
 * Get all notifications
 */
export const getNotifications = (): Notification[] => {
  return [...notifications];
};

/**
 * Clear all notifications
 */
export const clearNotifications = () => {
  notifications = [];
  notifySubscribers();
};
