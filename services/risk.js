const CRITICAL_EVENTS = new Set(["password_change", "recovery_change"]);
const HIGH_EVENTS = new Set(["security_setting_change", "suspicious_activity"]);
const LOGIN_EVENTS = new Set(["new_login", "new_device"]);

export function classify({ eventType, trusted }) {
  if (CRITICAL_EVENTS.has(eventType)) return "CRITICAL";
  if (HIGH_EVENTS.has(eventType)) return "HIGH";
  if (LOGIN_EVENTS.has(eventType)) return trusted ? "LOW" : "HIGH";
  return "MEDIUM";
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function isSleeping({ sleepMode, sleepStart, sleepEnd }, now = new Date()) {
  if (!sleepMode) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(sleepStart);
  const end = toMinutes(sleepEnd);
  return start < end ? current >= start && current < end : current >= start || current < end;
}

export const needsSiren = (severity, sleeping) =>
  severity === "CRITICAL" || (sleeping && severity === "HIGH");
