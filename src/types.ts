export interface Context{
  visitorId: string;
  sessionId: string;
  userAgent: string;
  language: string;
  screenSize: string;
  pageUrl: string;
  referrer: string;
};

export interface EventPayload  {
  eventType: string;
  properties: Record<string, any>;
  context: Context;
  timestamp: string;
};

export interface QueuedEvent  {
  payload: EventPayload;
  retryCount: number;
  nextAttempt: number; // timestamp in ms
};
export interface AnalyticsConfig  {
  clientId: string;
  apiEndpoint?: string;
  debug?: boolean;
  autoTrackPageViews?: boolean;
  autoTrackClicks?: boolean;
  autoTrackForms?: boolean;
  [key: string]: any;
};

