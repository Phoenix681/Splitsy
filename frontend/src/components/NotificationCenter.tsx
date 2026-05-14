import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, InfoIcon, AlertTriangle } from 'lucide-react';
import { 
  getNotifications, 
  removeNotification, 
  subscribeToNotifications, 
  unsubscribeFromNotifications,
  type Notification 
} from '../utils/notifications';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());

  useEffect(() => {
    // Subscribe to notification updates
    const handleNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    subscribeToNotifications(handleNotifications);

    return () => {
      unsubscribeFromNotifications(handleNotifications);
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[999] space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border animation-slide-in ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {notification.type === 'info' && (
              <InfoIcon className="h-5 w-5 text-blue-600" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{notification.message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-2 inline-flex text-current hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animation-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
