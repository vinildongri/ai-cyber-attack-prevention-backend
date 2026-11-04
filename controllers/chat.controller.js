import { db } from "../config/db.js";

const HELP =
  "Try: 'What happened while I was sleeping?', 'Which accounts had alerts today?', " +
  "'Show my latest security event', or 'Any unresolved high-risk events?'";

const describe = (e) =>
  `${e.account.platform}: ${e.eventType.replaceAll("_", " ")} (${e.severity}) at ${e.createdAt.toLocaleString()}`;

const findEvents = (userId, where = {}, take = 20) =>
  db.securityEvent.findMany({
    where: { account: { userId }, ...where },
    include: { account: true },
    orderBy: { createdAt: "desc" },
    take,
  });

function lastSleepStart(sleepStart, now = new Date()) {
  const [h, m] = sleepStart.split(":").map(Number);
  const start = new Date(now);
  start.setHours(h, m, 0, 0);
  if (start > now) start.setDate(start.getDate() - 1);
  return start;
}

export async function chat(req, res) {
  const text = String(req.body.message ?? "").toLowerCase();
  const { userId } = req;
  let events, intro, empty;

  if (/unresolved|pending|high.?risk/.test(text)) {
    events = await findEvents(userId, { status: "PENDING", severity: { in: ["HIGH", "CRITICAL"] } });
    intro = "Unresolved high-risk events:";
    empty = "No unresolved high-risk events.";
  } else if (/sleep|night/.test(text)) {
    const settings = await db.userSettings.findUnique({ where: { userId } });
    events = await findEvents(userId, { createdAt: { gte: lastSleepStart(settings.sleepStart) } });
    intro = "While you were sleeping:";
    empty = "Nothing happened while you were sleeping.";
  } else if (/today/.test(text)) {
    const midnight = new Date().setHours(0, 0, 0, 0);
    events = await findEvents(userId, { createdAt: { gte: new Date(midnight) } });
    intro = "Alerts today:";
    empty = "No alerts today.";
  } else if (/latest|last|recent/.test(text)) {
    events = await findEvents(userId, {}, 1);
    intro = "Your latest security event:";
    empty = "No security events yet.";
  } else {
    return res.json({ reply: HELP, events: [] });
  }

  res.json({ reply: events.length ? `${intro}\n${events.map(describe).join("\n")}` : empty, events });
}
