import { track } from "../common/index";

export function trackPageView(): void {
  const properties = {
    title: document.title,
    url: window.location.href,
    referrer: document.referrer,
  };
  track("page_view", properties);
}