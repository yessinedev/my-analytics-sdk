import { track } from "../index";

export function initScrollTracking(): void {
  const milestones = [25, 50, 75, 100];
  const reached: Record<number, boolean> = {};

  let ticking = false;

  function getScrollPercent(): number {
    const scrollTop =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    return Math.min(100, ((scrollTop + viewportHeight) / docHeight) * 100);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const percent = getScrollPercent();
        for (const m of milestones) {
          if (!reached[m] && percent >= m) {
            reached[m] = true;
            track("scroll_depth", {
              milestone: m,
              percent: Math.round(percent),
              url: window.location.href,
            });
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}
