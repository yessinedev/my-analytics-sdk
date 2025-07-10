import { setConfig } from "./config";
import { track } from "./common/index";
import { initClickTracking } from "./autotrack/clicks";
import { trackPageView } from "./autotrack/pageview";
import { AnalyticsConfig } from "./types";
import { initFormEngagementTracking, initFormsTracking } from "./autotrack/forms";
import { initScrollTracking } from "./autotrack/scroll";
import { startSessionTracking } from "./autotrack/session";

function init(options: AnalyticsConfig): void {
  setConfig(options);
  console.log("Analytics initialized with:", options);
  if (options.autoTrackPageViews) {
    trackPageView();
  }
  if (options.autoTrackClicks) {
    initClickTracking();
  }
  if(options.autoTrackForms){
    initFormsTracking();
    initFormEngagementTracking();
  }
  if(options.autoTrackScroll) {
    initScrollTracking();
  }
  if (options.autoTrackSession) {
    startSessionTracking();
  }
}

export { init, track };
