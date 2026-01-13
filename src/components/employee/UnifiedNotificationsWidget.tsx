import React, { useState, useEffect } from 'react';
import { Bell, Check, Archive, Clock, Filter, AlertCircle } from 'lucide-react';
import { unifiedNotificationsService, UnifiedNotification } from '../../services/unifiedNotificationsService';

export const UnifiedNotificationsWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [filtered, setFiltered] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [view, setView] = useState<'all' | 'filtered'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notifs, count, filteredData] = await Promise.all([
        unifiedNotificationsService.getNotifications({ limit: 20 }),
        unifiedNotificationsService.getUnreadCount(),
        unifiedNotificationsService.smartFilter(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
      setFiltered(filteredData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await unifiedNotificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await unifiedNotificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await unifiedNotificationsService.archiveNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const handleSnooze = async (id: string, minutes: number) => {
    try {
      await unifiedNotificationsService.snoozeNotification(id, minutes);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error('Error snoozing notification:', error);
    }
  };

  const getPriorityColor = (priority: UnifiedNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-slate-300 bg-slate-50';
    }
  };

  const getPriorityIcon = (priority: UnifiedNotification['priority']) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle size={16} className={priority === 'urgent' ? 'text-red-600' : 'text-orange-600'} />;
    }
    return null;
  };

  const displayNotifications = view === 'all' ? notifications : filtered?.urgent || [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'all' ? 'filtered' : 'all')}
            className={`p-2 rounded-lg transition-colors ${
              view === 'filtered'
                ? 'bg-blue-100 text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter size={18} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Check size={18} />
            </button>
          )}
        </div>
      </div>

      {view === 'filtered' && filtered && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-700">{filtered.urgent.length}</div>
            <div className="text-xs text-red-600">Urgent</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">{filtered.actionable.length}</div>
            <div className="text-xs text-blue-600">Action</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-700">{filtered.informational.length}</div>
            <div className="text-xs text-slate-600">Info</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-700">{filtered.lowPriority.length}</div>
            <div className="text-xs text-slate-600">Faible</div>
          </div>
        </div>
      )}

      {displayNotifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check size={32} className="text-emerald-600" />
          </div>
          <p className="text-slate-600 font-medium">Aucune notification</p>
          <p className="text-sm text-slate-500 mt-1">Vous êtes à jour!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`group p-3 rounded-lg transition-all ${
                notif.is_read ? 'bg-slate-50' : getPriorityColor(notif.priority)
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {getPriorityIcon(notif.priority)}
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {notif.source_tool} • {new Date(notif.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {notif.content && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{notif.content}</p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSnooze(notif.id, 60)}
                    className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                    title="Snooze 1h"
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    onClick={() => handleArchive(notif.id)}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                    title="Archiver"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>

              {notif.action_url && (
                <a
                  href={notif.action_url}
                  className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Voir détails →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Notifications de tous vos outils en un seul endroit
        </p>
      </div>
    </div>
  );
};
