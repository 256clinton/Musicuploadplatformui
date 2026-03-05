import { useState } from 'react';
import { Bell, Check, X, Music, DollarSign, Users, AlertCircle, Calendar, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  type: 'track_status' | 'payment' | 'collaboration' | 'milestone' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'track_status',
      title: 'Track Approved! 🎉',
      message: '"Kampala Nights" has been approved and will go live on March 15, 2026',
      timestamp: '2 hours ago',
      read: false,
      actionUrl: '/dashboard'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received 45,000 UGX for your February streams',
      timestamp: '5 hours ago',
      read: false,
      actionUrl: '/dashboard?tab=earnings'
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'Collaboration Invite',
      message: 'John Doe invited you to collaborate on "New Track"',
      timestamp: '1 day ago',
      read: true,
      actionUrl: '/collaborations'
    },
    {
      id: '4',
      type: 'milestone',
      title: '10,000 Streams Milestone! 🎊',
      message: 'Your track "Pearl of Africa" just hit 10,000 total streams',
      timestamp: '2 days ago',
      read: true,
      actionUrl: '/dashboard?tab=analytics'
    },
    {
      id: '5',
      type: 'system',
      title: 'New Platform Added',
      message: 'Your music is now available on Amazon Music',
      timestamp: '3 days ago',
      read: true
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'track_status':
        return <Music className="w-6 h-6 text-purple-600" />;
      case 'payment':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'collaboration':
        return <Users className="w-6 h-6 text-blue-600" />;
      case 'milestone':
        return <TrendingUp className="w-6 h-6 text-orange-600" />;
      case 'system':
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'track_status':
        return 'bg-purple-50 border-purple-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'collaboration':
        return 'bg-blue-50 border-blue-200';
      case 'milestone':
        return 'bg-orange-50 border-orange-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-gray-700" />
            <h3 className="font-bold text-xl">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-all ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${getNotificationBgColor(notification.type)} flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </h4>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-all"
                          title="Delete"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notification.timestamp}
                      </span>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time updates enabled</span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-semibold">
            Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}
