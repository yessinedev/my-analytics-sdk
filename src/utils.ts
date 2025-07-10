
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return timestamp + randomPart;
}

export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem("visitorId");

  if (!visitorId) {
    visitorId = generateUniqueId();
    localStorage.setItem("visitorId", visitorId);
  }

  return visitorId;
}

export function getOrCreateSessionId() {
  const EXPIRATION_MINUTES = 30;
  const now = Date.now();

  let sessionId = sessionStorage.getItem("sessionId");
  let expiry = parseInt(sessionStorage.getItem("sessionExpiry") ?? "0", 10);

  if (!sessionId || !expiry || now > expiry) {
    sessionId = generateUniqueId();
    expiry = now + EXPIRATION_MINUTES * 60 * 1000;
    sessionStorage.setItem("sessionId", sessionId);
    sessionStorage.setItem("sessionExpiry", expiry.toString());
  }
  return sessionId;
}

