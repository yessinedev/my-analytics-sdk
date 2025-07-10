import { track } from "../common";
import { getConfig } from "../config";

const WHITELISTED_INPUT_TYPES = [
  "text",
  "search",
  "email",
  "tel",
  "url",
  "number",
  "date",
  "datetime-local",
  "month",
  "week",
  "time",
  "color",
];

export function initFormsTracking(): void {
  document.addEventListener("submit", (event) => {
    const config = getConfig();
    if (config.disableFormTracking) return;

    const target = event.target as HTMLElement;
    if (!target || !(target instanceof HTMLFormElement)) return;

    let el: HTMLElement | null = target;
    while (el) {
      if (el.hasAttribute("data-analytics-ignore")) return;
      el = el.parentElement;
    }

    const inputs = Array.from(target.elements)
      .filter((el) => {
        if (el instanceof HTMLInputElement) {
          // Use indexOf for compatibility
          return WHITELISTED_INPUT_TYPES.indexOf(el.type) !== -1;
        }
        return (
          el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement
        );
      })
      .map((el, index) => {
        let type = "";
        if (el instanceof HTMLInputElement) type = el.type;
        return {
          name:
            (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
              .name || `unnamed_field_${index}`,
          type,
          tag: el.tagName,
        };
      });

    const properties = {
      page: window.location.pathname,
      tag: target.tagName,
      id: target.id || "",
      classes:
        typeof target.className === "string"
          ? target.className
          : Array.from(target.classList).join(" "),
      action: target.action || "",
      method: target.method || "",
      inputs,
    };

    track("form_submit", properties);
  });
}

export function initFormEngagementTracking(): void {
  document.addEventListener("focusin", (event) => {
    const target = event.target as HTMLElement;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      )
    )
      return;

    const form = target.closest("form") as HTMLFormElement | null;
    if (!form) return;
    let el: HTMLElement | null = target;
    while (el) {
      if (el.hasAttribute("data-analytics-ignore")) return;
      el = el.parentElement;
    }
    const properties = {
      page: window.location.pathname,
      tag: target.tagName,
      id: target.id || "",
      classes:
        typeof target.className === "string"
          ? target.className
          : Array.from(target.classList).join(" "),
      action: form.action || "",
      method: form.method || "",
    };
    track("form_engaged", properties);
  });
}
