import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, Info, Clock } from 'lucide-react';
import { User } from '../types';
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications';
import { Portal } from './ui/Portal';

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  type?: string;
  unread: boolean;
  time: string;
}

interface TopBarProps {
  user: User;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const { data: notificationsData } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifMenuRef = useRef<HTMLDivElement>(null);

  const notifications: NotificationItem[] = notificationsData ?? [];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkRead = async (id: string) => {
    await markRead.mutateAsync(id);
  };

  const handleOpenNotification = (n: NotificationItem) => {
    setSelectedNotification(n);
    if (n.unread) {
      void handleMarkRead(n.id);
    }
  };

  const markAllAsRead = async () => {
    await markAllRead.mutateAsync();
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="xl:hidden p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-all cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Field */}
        <div className="relative w-full sm:w-80 md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            className="w-full pl-10 pr-8 py-2.5 bg-transparent text-sm text-slate-700 placeholder-slate-400 border border-transparent focus:border-slate-200 focus:bg-white rounded-full transition-all outline-none"
            placeholder="Tap to search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Header Items: Notifications & User Profile */}
      <div className="flex items-center gap-3 self-end sm:self-auto relative">
        {/* Notification Bell with Badge */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-100 rounded-full hover:shadow-xs transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] bg-[#3256a8] text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] p-4 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Campus Alerts
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#3256a8] hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNotification(n)}
                    className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      n.unread ? 'bg-blue-50/70 border border-blue-100/60' : 'bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    {n.body && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.body}</p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white shadow-xs shrink-0">
            <img
              alt={`${user.name} Profile`}
              className="w-full h-full object-cover"
              src={user.avatarUrl}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <h4 className="text-sm font-bold text-slate-800">{user.name}</h4>
            <p className="text-xs text-slate-400 font-medium">{user.role}</p>
          </div>
        </div>
      </div>

      {selectedNotification && (
        <Portal>
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-[#3256a8]">
                  <Info className="w-4.5 h-4.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                  {selectedNotification.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {selectedNotification.body && (
              <p className="text-sm text-slate-600 leading-relaxed mt-3 whitespace-pre-wrap">
                {selectedNotification.body}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedNotification.time}</span>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </header>
  );
};
