import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  is_read: boolean;
}

const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Global notification store — shared with useReminders
export const notificationStore: NotificationItem[] = [];
export const notificationListeners: (() => void)[] = [];

export const addNotification = (message: string) => {
  const item: NotificationItem = {
    id: Date.now().toString(),
    message,
    time: new Date().toISOString(),
    is_read: false,
  };
  notificationStore.unshift(item);
  if (notificationStore.length > 20) notificationStore.pop();
  notificationListeners.forEach((fn) => fn());
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const refresh = () => setNotifications([...notificationStore]);

  useEffect(() => {
    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    notificationListeners.push(refresh);
    return () => {
      const idx = notificationListeners.indexOf(refresh);
      if (idx > -1) notificationListeners.splice(idx, 1);
    };
  }, []);

  // Shake bell when new notification arrives
  useEffect(() => {
    const unread = notifications.filter((n) => !n.is_read).length;
    if (unread > 0) {
      setShaking(true);
      setTimeout(() => setShaking(false), 800);
    }
  }, [notifications.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      // Mark all as read
      notificationStore.forEach((n) => (n.is_read = true));
      setNotifications([...notificationStore]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    notificationStore.length = 0;
    setNotifications([]);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        title="Notifications"
      >
        <Bell className={`h-5 w-5 text-muted-foreground ${shaking ? "animate-bounce" : ""}`} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">🎉 You're all caught up!</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 ${!n.is_read ? "bg-orange-50 dark:bg-orange-950/20" : ""}`}>
                  <p className="text-sm text-foreground leading-snug">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.time)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
