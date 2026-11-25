import { apiFetch } from "./auth";
import type { AppNotification } from "./api/notification";

export type StreamEvent =
  | { type: "ready"; unreadCount: number; reconnect: boolean }
  | { type: "notification"; notification: AppNotification; unreadCount: number }
  | { type: "unread-count"; unreadCount: number }
  | { type: "resync" };

type Subscriber = {
  onEvent: (event: StreamEvent) => void;
  onStatus?: (connected: boolean) => void;
};

const STREAM_PATH = "/api/notifications/stream";
const CLOSE_GRACE_MS = 2_000; 
const IDLE_TIMEOUT_MS = 70_000;
const MAX_BACKOFF_MS = 30_000;

const subscribers = new Set<Subscriber>();
let controller: AbortController | null = null;
let connected = false;
let connectCount = 0;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function setConnected(value: boolean) {
  if (connected === value) return;
  connected = value;
  subscribers.forEach((s) => s.onStatus?.(value));
}

function emit(event: StreamEvent) {
  subscribers.forEach((s) => {
    try {
      s.onEvent(event);
    } catch (err) {
      console.error("[notification-stream] handler failed:", err);
    }
  });
}

function handleBlock(block: string) {
  let name = "message";
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) name = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  if (dataLines.length === 0) return;

  let data: any;
  try {
    data = JSON.parse(dataLines.join("\n"));
  } catch {
    return;
  }

  switch (name) {
    case "ready":
      emit({ type: "ready", unreadCount: data.unreadCount, reconnect: connectCount > 1 });
      break;
    case "notification":
      emit({ type: "notification", notification: data.notification, unreadCount: data.unreadCount });
      break;
    case "unread-count":
      emit({ type: "unread-count", unreadCount: data.unreadCount });
      break;
    case "resync":
      emit({ type: "resync" });
      break;
  }
}

async function readEvents(body: ReadableStream<Uint8Array>, onActivity: () => void): Promise<boolean> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return true;

      onActivity();
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, "");
        handleBlock(block);
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

async function run(signal: AbortSignal) {
  let failures = 0;

  try {
    while (!signal.aborted) {
      const attempt = new AbortController();
      const abortAttempt = () => attempt.abort();
      signal.addEventListener("abort", abortAttempt, { once: true });

      let watchdog: ReturnType<typeof setTimeout> | undefined;
      const resetWatchdog = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => attempt.abort(), IDLE_TIMEOUT_MS);
      };

      let endedCleanly = false;
      let connectedAt = 0;

      try {
        resetWatchdog();
        const res = await apiFetch(STREAM_PATH, {
          headers: { Accept: "text/event-stream" },
          signal: attempt.signal,
        });

        if (res.status === 401 || res.status === 403) return;
        if (!res.ok || !res.body) throw new Error(`Stream rejected with status ${res.status}`);

        connectCount += 1;
        connectedAt = Date.now();
        setConnected(true);
        endedCleanly = await readEvents(res.body, resetWatchdog);
      } catch {
      } finally {
        clearTimeout(watchdog);
        signal.removeEventListener("abort", abortAttempt);
      }

      setConnected(false);
      if (signal.aborted) return;

      
      const healthy = endedCleanly || (connectedAt > 0 && Date.now() - connectedAt > 10_000);
      failures = healthy ? 0 : failures + 1;

      const delay = endedCleanly
        ? 500 
        : Math.min(MAX_BACKOFF_MS, 1000 * 2 ** Math.max(0, failures - 1)) + Math.random() * 500;

      await sleep(delay, signal);
    }
  } finally {
    setConnected(false);
    if (controller?.signal === signal) controller = null;
  }
}

function start() {
  connectCount = 0;
  controller = new AbortController();
  void run(controller.signal);
}

function stop() {
  controller?.abort();
  controller = null;
  setConnected(false);
}

export function subscribeToNotificationStream(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  subscriber.onStatus?.(connected);

  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (!controller) start();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && !closeTimer) {
      closeTimer = setTimeout(() => {
        closeTimer = null;
        if (subscribers.size === 0) stop();
      }, CLOSE_GRACE_MS);
    }
  };
}