import { getConfig } from "../config";
import { sendEvent } from "../transport";
import { Context, EventPayload } from "../types";
import { getOrCreateSessionId, getOrCreateVisitorId } from "../utils";

export function track(
  eventType: string,
  properties: Record<string, any> = {}
): void {
  const config = getConfig();

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();

  const context: Context = {
    visitorId,
    sessionId,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    pageUrl: window.location.href,
    referrer: document.referrer,
  };

  const event: EventPayload = {
    eventType,
    properties,
    context,
    timestamp: new Date().toISOString(),
  };
  if (config?.debug) {
    console.log("Tracking event:", event);
  }
  try {
    sendEvent(event);
  } catch (error) {
    if (config?.debug) console.error("Failed to send event:", error);
  }
}
