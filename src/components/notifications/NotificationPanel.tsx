'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPanel() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = () => {
      fetchNotifications();
    };

    socket.on('notificationCreated', handleNotification);
    return () => {
      socket.off('notificationCreated', handleNotification);
    };
  }, [socket]);

  const markAllRead = async () => {
    if (notifications.length === 0) return;
    const ids = notifications.map((n) => n._id);
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: ids, isRead: true }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl border border-green-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-green-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">Updates on new bookings and actions</p>
          </div>
        </div>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-green-50">
            {notifications.map((notification) => (
              <li key={notification._id} className="p-4 hover:bg-green-50/40 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
