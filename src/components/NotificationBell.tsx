'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';

interface NotificationBellProps {
  childId: string | null;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `${diffMinutes}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function priorityColor(priority: AppNotification['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-l-error';
    case 'medium':
      return 'border-l-primary';
    default:
      return 'border-l-white/20';
  }
}

export default function NotificationBell({ childId }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    isRead,
  } = useNotifications(childId);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
      >
        <span className="text-xl">🔔</span>

        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-bg-secondary border border-white/10 rounded-xl shadow-2xl z-50 animate-fadeInUp">
          {/* Header do dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="px-4 py-8 text-center text-white/50 text-sm">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-2xl block mb-2">✅</span>
                <p className="text-white/60 text-sm">Tudo em dia!</p>
              </div>
            ) : (
              notifications.map(notification => {
                const read = isRead(notification.id);
                return (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-l-2 ${priorityColor(notification.priority)} ${
                      read ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 shrink-0">
                        {notification.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-medium truncate ${
                              read ? 'text-white/50' : 'text-white'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${read ? 'text-white/30' : 'text-white/70'}`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          {formatRelativeDate(notification.date)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
