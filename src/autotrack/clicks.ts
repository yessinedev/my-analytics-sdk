import { track } from "../common/index";

export function initClickTracking() {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target || !(target instanceof HTMLElement)) return;
    let el: HTMLElement | null = target;
    while (el) {
      if (el.hasAttribute("data-analytics-ignore")) return;
      el = el.parentElement;
    }

    let properties = {
      tag: target.tagName,
      id: target.id || "",
      classes: target.className || "",
      text: target.textContent?.trim() || "",
      path: window.location.pathname,
    };

    track("click", properties);
  });
}
