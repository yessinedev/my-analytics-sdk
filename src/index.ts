import { setConfig } from "./config";
import { track } from "./common/index";
import { initClickTracking } from "./autotrack/clicks";
import { trackPageView } from "./autotrack/pageview";
import { AnalyticsConfig } from "./types";
import {
  initFormEngagementTracking,
  initFormsTracking,
} from "./autotrack/forms";
import { initScrollTracking } from "./autotrack/scroll";
import { startSessionTracking } from "./autotrack/session";
import { getVisitorId, initIdentifiers } from "./lib/ids";

async function init(options: AnalyticsConfig): Promise<void> {
  setConfig(options);
  console.log("Analytics initialized with:", options);
  initIdentifiers().then(() => {
    console.log("Identifiers initialized:", {
      visitorId: getVisitorId(),
    });
    if (options.autoTrackSession) {
      startSessionTracking();
    }
    if (options.autoTrackPageViews) {
      trackPageView();
    }
    if (options.autoTrackClicks) {
      initClickTracking();
    }
    if (options.autoTrackForms) {
      initFormsTracking();
      initFormEngagementTracking();
    }
    if (options.autoTrackScroll) {
      initScrollTracking();
    }
  });
}

export { init, track };
