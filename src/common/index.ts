import { getConfig } from "../config";
import { sendEvent } from "../transport";
import { Context, EventPayload } from "../types";
import { getOrCreateSessionId, getOrCreateVisitorId } from "../lib/utils";
import { getSessionId, getVisitorId } from "../lib/ids";

export function track(
  eventType: string,
  properties: Record<string, any> = {}
): void {
  const config = getConfig();
  console.log(config);
  console.log(properties);
  

  const context: Context = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    pageUrl: window.location.href,
    referrer: document.referrer,
  };

  const event: EventPayload = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    eventType,
    properties,
    context,
    timestamp: new Date().toISOString(),
  };
  if (config?.debug) {
    console.log("Tracking event:", event);
  }
  try {
    console.log("Tracking event:", event);

    sendEvent(event);
  } catch (error) {
    if (config?.debug) console.error("Failed to send event:", error);
  }
}
