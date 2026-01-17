import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, User, X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsService, Notification as NotificationType } from '../../services/notificationsService';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationsService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationsService.markAllAsRead(user.id);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      default:
        return notifications;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'transfer_approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'transfer_rejected':
        return <XCircle className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;

    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden max-h-[600px]"
            >
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'unread'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Non lues
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="text-slate-400 text-sm">Chargement...</div>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800 text-left ${
                        !notification.read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.read
                            ? 'bg-slate-800 text-slate-500'
                            : notification.type === 'transfer_approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : notification.type === 'transfer_rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold mb-1 ${
                            notification.read ? 'text-slate-400' : 'text-white'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p
                          className={`text-sm mb-1 ${
                            notification.read ? 'text-slate-500' : 'text-slate-300'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <span className="text-xs text-slate-500">
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400 text-sm">
                      Aucune notification
                    </p>
                  </div>
                )}
              </div>

              {unreadCount > 0 && (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <button
                    onClick={markAllAsRead}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
