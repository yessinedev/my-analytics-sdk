import { track } from "../index";
import { getOrCreateSessionId } from "../utils";

const SESSION_KEY = "analytics_session_info_v1";
const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 60000; // 1 minute

interface SessionInfo {
  sessionId: string;
  activeTime: number; // ms
  lastActive: number; // timestamp
  startedAt: number; // timestamp
}

let session: SessionInfo | null = null;
let active = true;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let isNewSession = false;

function loadSession(): SessionInfo {
  const raw = localStorage.getItem(SESSION_KEY);
  let stored: SessionInfo | null = null;

  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (data && typeof data.sessionId === "string") {
        stored = data;
      }
    } catch {
      // ignore parse errors
    }
  }

  const validSessionId = getOrCreateSessionId();

  if (stored && stored.sessionId === validSessionId) {
    isNewSession = false; // Continuing existing session
    return stored;
  }

  // New session
  isNewSession = true;
  return {
    sessionId: validSessionId,
    activeTime: 0,
    lastActive: Date.now(),
    startedAt: Date.now(),
  };
}

function saveSession() {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

let lastActiveCall = 0;
const ACTIVE_THROTTLE = 1000; // ms

function onUserActive() {
  const now = Date.now();
  if (now - lastActiveCall < ACTIVE_THROTTLE) return;
  lastActiveCall = now;
  if (!active) {
    active = true;
    if (session) session.lastActive = now;
    startInactivityTimer();
    startHeartbeat();
  } else {
    if (session) session.lastActive = now;
  }
  saveSession();
}

function onUserInactive() {
  if (active) {
    active = false;
    if (session) {
      const now = Date.now();
      session.activeTime += now - session.lastActive;
      session.lastActive = now;
    }
    saveSession();
  }
}

function startInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    onUserInactive();
  }, INACTIVITY_TIMEOUT);
}

function startHeartbeat() {
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(() => {
    if (active && session) {
      const now = Date.now();
      session.activeTime += now - session.lastActive;
      session.lastActive = now;
      track("session_heartbeat", {
        sessionId: session.sessionId,
        activeTime: session.activeTime,
        startedAt: session.startedAt,
        timestamp: now,
      });
      saveSession();
      startHeartbeat();
    }
  }, HEARTBEAT_INTERVAL);
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    onUserInactive();
  } else if (document.visibilityState === "visible") {
    onUserActive();
  }
}

function onUnload() {
  if (session) {
    if (active) {
      const now = Date.now();
      session.activeTime += now - session.lastActive;
      session.lastActive = now;
    }
    track("session_end", {
      sessionId: session.sessionId,
      activeTime: session.activeTime,
      startedAt: session.startedAt,
      timestamp: Date.now(),
    });
    saveSession();
  }
}

export function startSessionTracking() {
  session = loadSession();
  active = true;
  if (session) session.lastActive = Date.now();
  saveSession();
  startInactivityTimer();
  startHeartbeat();

  // Track session_start only if new session
  if (isNewSession && session) {
    track("session_start", {
      sessionId: session.sessionId,
      startedAt: session.startedAt,
    });
  }

  // Setup listeners
  window.addEventListener("mousemove", onUserActive);
  window.addEventListener("keydown", onUserActive);
  window.addEventListener("scroll", onUserActive);
  window.addEventListener("focus", onUserActive);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onUnload);
  window.addEventListener("pagehide", onUnload);

  // Cleanup function for SPA scenarios
  return function cleanupSessionTracking() {
    window.removeEventListener("mousemove", onUserActive);
    window.removeEventListener("keydown", onUserActive);
    window.removeEventListener("scroll", onUserActive);
    window.removeEventListener("focus", onUserActive);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("beforeunload", onUnload);
    window.removeEventListener("pagehide", onUnload);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
  };
}
