import { getConfig } from "./config";
import { EventPayload, QueuedEvent } from "./types";

const EVENT_BATCH_SIZE = 5;
const EVENT_BATCH_INTERVAL = 5000; // ms

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 1000; // 1s
const STORAGE_KEY = "analytics_event_queue_v1";
let eventQueue: QueuedEvent[] = [];
// Load queue from storage on startup
function loadQueueFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        eventQueue = arr;
      }
    }
  } catch (e) {
    // ignore
  }
}

function saveQueueToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventQueue));
  } catch (e) {
    // ignore
  }
}
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function flushQueue() {
  const now = Date.now();
  if (eventQueue.length === 0) return;

  // Only send events whose nextAttempt is due
  const readyEvents = eventQueue
    .filter((e) => e.nextAttempt <= now)
    .slice(0, EVENT_BATCH_SIZE);
  if (readyEvents.length === 0) return;

  // Remove these from the queue
  for (const evt of readyEvents) {
    const idx = eventQueue.indexOf(evt);
    if (idx !== -1) eventQueue.splice(idx, 1);
  }
  saveQueueToStorage();

  const batchPayload = readyEvents.map((e) => e.payload);
  const config = getConfig();
  const endpoint = config.apiEndpoint || "http://localhost:3000/api/events";
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        batchPayload.length === 1 ? batchPayload[0] : batchPayload
      ),
      keepalive: true,
    });
  } catch (err) {
    console.error("Failed to send analytics event batch", err);
    // Re-queue with incremented retryCount and exponential backoff
    for (const evt of readyEvents) {
      if (evt.retryCount < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, evt.retryCount);
        evt.retryCount++;
        evt.nextAttempt = Date.now() + delay;
        eventQueue.push(evt);
      } else {
        console.error("Dropping event after max retries", evt.payload);
      }
    }
    saveQueueToStorage();
  }
}

function scheduleFlush() {
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    flushQueue();
    batchTimer = null;
    if (eventQueue.length > 0) scheduleFlush();
  }, EVENT_BATCH_INTERVAL);
}

export function sendEvent(event: EventPayload) {
  const queued: QueuedEvent = {
    payload: event,
    retryCount: 0,
    nextAttempt: Date.now(),
  };
  eventQueue.push(queued);
  saveQueueToStorage();
  if (eventQueue.length >= EVENT_BATCH_SIZE) {
    flushQueue();
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
  } else {
    scheduleFlush();
  }
}

// Gracefully flush events on page exit/visibility change
function flushQueueSync() {
  if (eventQueue.length === 0) return;
  const readyEvents = eventQueue.filter((e) => e.nextAttempt <= Date.now());
  if (readyEvents.length === 0) return;
  const batchPayload = readyEvents.map((e) => e.payload);
  const config = getConfig();
  const endpoint = config.apiEndpoint || "http://localhost:3000/api/events";
  try {
    // Use sendBeacon for synchronous, reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        endpoint,
        new Blob(
          [
            JSON.stringify(
              batchPayload.length === 1 ? batchPayload[0] : batchPayload
            ),
          ],
          { type: "application/json" }
        )
      );
    } else {
      // fallback: synchronous XHR (deprecated, but as a last resort)
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, false); // false = synchronous
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify(
          batchPayload.length === 1 ? batchPayload[0] : batchPayload
        )
      );
    }
    // Remove sent events from queue
    for (const evt of readyEvents) {
      const idx = eventQueue.indexOf(evt);
      if (idx !== -1) eventQueue.splice(idx, 1);
    }
    saveQueueToStorage();
  } catch (err) {
    // Ignore errors on unload
    console.error("Failed to flush analytics events on page exit", err);
  }
}

function handlePageExit() {
  flushQueueSync();
  saveQueueToStorage();
  // On load, restore queue and try to flush
  loadQueueFromStorage();
  if (eventQueue.length > 0) {
    flushQueue();
  }
}

window.addEventListener("pagehide", handlePageExit);
window.addEventListener("beforeunload", handlePageExit);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    handlePageExit();
  }
});
