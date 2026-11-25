import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import {
  getUnreadCount,
  listNotifications,
  markAsRead,
  markAllAsRead,
  emitNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
  type AppNotification,
} from "../lib/api/notification";
import { subscribeToNotificationStream } from "../lib/notificationStream";

const FALLBACK_POLL_INTERVAL_MS = 45_000; 
const DROPDOWN_LIMIT = 8;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamConnectedRef = useRef(false);
  const navigate = useNavigate();

  const refreshCount = useCallback(async () => {
    try {
      const { unreadCount } = await getUnreadCount();
      setUnreadCount(unreadCount);
    } catch {
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await listNotifications({ limit: DROPDOWN_LIMIT });
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setListError(err.message || "Could not load notifications");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refreshCount();

    const interval = setInterval(() => {
      if (!document.hidden && !streamConnectedRef.current) refreshCount();
    }, FALLBACK_POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) refreshCount();
    };
    const onChanged = (e: Event) => {
      if ((e as CustomEvent).detail?.source === "bell") return;
      refreshCount();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    };
  }, [refreshCount]);

  useEffect(() => {
    return subscribeToNotificationStream({
      onStatus: (connected) => {
        streamConnectedRef.current = connected;
      },
      onEvent: (event) => {
        switch (event.type) {
          case "ready":
            setUnreadCount(event.unreadCount);
            
            if (event.reconnect) emitNotificationsChanged("bell");
            break;

          case "notification":
            setUnreadCount(event.unreadCount);
            setItems((prev) =>
              prev.some((i) => i.id === event.notification.id)
                ? prev 
                : [event.notification, ...prev].slice(0, DROPDOWN_LIMIT)
            );
            emitNotificationsChanged("bell");
            break;

          case "unread-count":
            setUnreadCount(event.unreadCount);
            break;

          case "resync":
            refreshCount();
            emitNotificationsChanged("bell");
            break;
        }
      },
    });
  }, [refreshCount]);


  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const handleItemClick = (n: AppNotification) => {
    setOpen(false);

    if (!n.isRead) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markAsRead(n.id)
        .then(() => emitNotificationsChanged("bell"))
        .catch(() => {
        });
    }

    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnreadCount(0);
      emitNotificationsChanged("bell");
    } catch (err: any) {
      setListError(err.message || "Could not mark all as read");
    }
  };

  return (
    <div className="md:relative" ref={containerRef}>
      <button
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-primary hover:text-primary"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg shadow-ink/10 md:left-auto md:right-0 md:w-96">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-semibold text-primary hover:text-primary-deep"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {loadingList && items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-soft">Loading…</p>
            ) : listError ? (
              <p className="px-4 py-6 text-sm text-red-600">{listError}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-soft">You're all caught up.</p>
            ) : (
              <div className="divide-y divide-line">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onOpen={handleItemClick} />
                ))}
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-surface"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}