import { getOrCreateSessionId, getOrCreateVisitorId } from "./utils";

let visitorId: string | null = null;
let sessionId: string | null = null;

export async function initIdentifiers(): Promise<void> {
  visitorId = getOrCreateVisitorId();
  sessionId = getOrCreateSessionId();
  // Optional: simulate async delay
  return new Promise((resolve) => setTimeout(resolve, 50));
}

export function getVisitorId(): string {
  return visitorId || getOrCreateVisitorId();
}

export function getSessionId(): string {
  return sessionId || getOrCreateSessionId();
}
