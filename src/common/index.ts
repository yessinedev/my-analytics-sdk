import { sendEvent } from "../transport";
import { Context, EventPayload } from "../types";
import { getOrCreateSessionId, getOrCreateVisitorId } from "../utils";

export function track(eventType: string, properties: Record<string, any> = {}): void {
  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();

  const context: Context = {
    visitorId,
    sessionId,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    pageUrl: window.location.href,
    referrer: document.referrer,
  };

  const event: EventPayload = {
    eventType,
    properties,
    context,
    timestamp: new Date().toISOString(),
  };
  console.log("Tracking event:", event);
  //sendEvent(event);
}