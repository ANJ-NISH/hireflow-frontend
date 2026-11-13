import type { AppNotification, NotificationType } from "../lib/api/notification";

function categoryOf(type: NotificationType): string {
  if (type.startsWith("APPLICATION")) return "Application";
  if (type.startsWith("INTERVIEW")) return "Interview";
  if (type.startsWith("COMPANY")) return "Company";
  return "Job";
}

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-US", { dateStyle: "medium" });
}

function interviewTimeOf(n: AppNotification): string | null {
  if (!n.type.startsWith("INTERVIEW")) return null;

  const raw = n.data?.scheduledAt;
  if (typeof raw !== "string") return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function NotificationItem({
  notification,
  onOpen,
  onDelete,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  onDelete?: (n: AppNotification) => void;
}) {
  const when = interviewTimeOf(notification);

  return (
    <div className={`flex items-start ${notification.isRead ? "" : "bg-primary-soft/50"}`}>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left hover:bg-surface"
      >
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-transparent" : "bg-primary"}`}
        />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft/70">
            {categoryOf(notification.type)}
          </span>
          <span
            className={`mt-0.5 block text-sm text-ink ${notification.isRead ? "font-medium" : "font-semibold"}`}
          >
            {notification.title}
          </span>
          <span className="mt-0.5 block text-sm text-ink-soft">{notification.message}</span>
          {when && <span className="mt-1 block text-xs font-medium text-primary">Interview: {when}</span>}
          <span className="mt-1 block text-xs text-ink-soft/70">{timeAgo(notification.createdAt)}</span>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(notification)}
          aria-label="Delete notification"
          className="mr-3 mt-3 shrink-0 rounded-full p-1.5 text-ink-soft/60 hover:bg-surface hover:text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}