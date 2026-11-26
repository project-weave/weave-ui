// Remembers (for this tab) which event was just created, so its page can say "Event created" once it has loaded.
const KEY = "weave:justCreatedEvent";

export function markEventJustCreated(eventId: string) {
  try {
    sessionStorage.setItem(KEY, eventId);
  } catch {}
}

// true once for the event that was just created, then forgets it
export function consumeEventJustCreated(eventId: string): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== eventId) return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
