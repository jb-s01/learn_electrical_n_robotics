export function notifyProgressUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("lesson-progress-updated"));
}
