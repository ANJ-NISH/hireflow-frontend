import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NotificationItem from "../components/NotificationItem";
import { isLoggedIn } from "../lib/auth";
import type { Pagination } from "../lib/api/job";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  emitNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
  type AppNotification,
} from "../lib/api/notification";

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const loggedIn = isLoggedIn();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listNotifications({ unreadOnly: filter === "unread", page, limit: PAGE_SIZE });

      if (data.notifications.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }

      setItems(data.notifications);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    load();
  }, [load, loggedIn]);

  useEffect(() => {
    const onChanged = (e: Event) => {
      if ((e as CustomEvent).detail?.source === "page") return; 
      load();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
  }, [load]);

  const handleOpen = (n: AppNotification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markAsRead(n.id)
        .then(() => emitNotificationsChanged("page"))
        .catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await markAllAsRead();
      emitNotificationsChanged("page");
      await load();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not mark all as read");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (n: AppNotification) => {
    setErrorMessage(null);
    try {
      await deleteNotification(n.id);
      emitNotificationsChanged("page");
      await load();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not delete notification");
    }
  };

  const switchFilter = (next: "all" | "unread") => {
    setFilter(next);
    setPage(1);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-ink">Log in to see your notifications</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Updates</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Notifications
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => switchFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filter === f
                    ? "bg-primary text-white"
                    : "border border-line text-ink-soft hover:border-primary hover:text-primary"
                }`}
              >
                {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={busy}
              className="text-sm font-semibold text-primary hover:text-primary-deep disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          {loading ? (
            <p className="px-5 py-8 text-sm text-ink-soft">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-soft">
              {filter === "unread"
                ? "You're all caught up."
                : "No notifications yet. Updates about your applications and interviews will show up here."}
            </p>
          ) : (
            <div className="divide-y divide-line">
              {items.map((n) => (
                <NotificationItem key={n.id} notification={n} onOpen={handleOpen} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 text-sm text-ink-soft">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}