import React, { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'fuel_request' | 'tank_update' | 'driver_update' | 'vehicle_update' | 'requisition_saved' | 'approval' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionBy: string;
  icon: string;
}

interface NotificationBarProps {
  isManagerOnly?: boolean;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ isManagerOnly = true }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('fuel_fleet_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.isRead).length);
      } catch {}
    }

    // Listen for notification events
    const handleNotification = (e: any) => {
      const notification = e.detail;
      addNotification(notification);
    };

    window.addEventListener('notification:new', handleNotification);
    return () => window.removeEventListener('notification:new', handleNotification);
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('fuel_fleet_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const typeColors: Record<Notification['type'], string> = {
    fuel_request: 'bg-blue-100 text-blue-700 border-blue-300',
    tank_update: 'bg-amber-100 text-amber-700 border-amber-300',
    driver_update: 'bg-purple-100 text-purple-700 border-purple-300',
    vehicle_update: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    requisition_saved: 'bg-green-100 text-green-700 border-green-300',
    approval: 'bg-rose-100 text-rose-700 border-rose-300',
    system: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <div className="fixed top-0 right-0 z-40 flex flex-col items-end">
      {/* Collapsed Notification Bell */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="m-6 relative p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {expanded && (
        <div className="m-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">System Notifications</h3>
                <p className="text-xs text-gray-500 mt-1">Recent changes & updates</p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">✨ All caught up!</p>
                <p className="text-xs mt-1">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">{notification.icon}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[notification.type]}`}>
                                {notification.type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400">{notification.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">By: {notification.actionBy}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2 justify-between">
              <button
                onClick={markAllAsRead}
                className="flex-1 text-sm px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
              >
                Mark All Read
              </button>
              <button
                onClick={clearAll}
                className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to trigger notifications from anywhere
export const triggerNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
  const event = new CustomEvent('notification:new', { detail: notification });
  window.dispatchEvent(event);
};

export default NotificationBar;
