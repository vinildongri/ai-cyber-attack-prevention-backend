import { db } from "../config/db.js";
import { SECURITY_LINKS } from "../config/securityLinks.js";
import { classify, isSleeping, needsSiren } from "../services/risk.js";
import { push } from "../services/realtime.js";

const RESPONSES = { recognized: "RECOGNIZED", secure: "SECURING" };

// Timeline
export async function listEvents(req, res) {
  const { accountId } = req.query;
  res.json(
    await db.securityEvent.findMany({
      where: { account: { userId: req.userId }, ...(accountId && { accountId }) },
      include: { account: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  );
}

// Ingestion: called by integrations, the Android companion, or a test script.
export async function createEvent(req, res) {
  const { accountId, eventType, device } = req.body;
  if (!accountId || !eventType) return res.status(400).json({ error: "accountId and eventType are required" });

  const { userId } = req;
  const account = await db.connectedAccount.findFirst({ where: { id: accountId, userId } });
  if (!account) return res.status(404).json({ error: "Account not found" });

  const [settings, trusted] = await Promise.all([
    db.userSettings.findUnique({ where: { userId } }),
    device ? db.trustedDevice.findUnique({ where: { userId_name: { userId, name: device } } }) : null,
  ]);

  const severity = classify({ eventType, trusted: Boolean(trusted) });
  const siren = needsSiren(severity, isSleeping(settings));
  const event = await db.securityEvent.create({
    data: { accountId, eventType, device, severity },
    include: { account: true },
  });

  push(userId, { type: "alert", siren, event });
  res.status(201).json({ event, siren });
}

// "Was this you?" answer
export async function respondToEvent(req, res) {
  const { response } = req.body;
  const status = RESPONSES[response];
  if (!status) return res.status(400).json({ error: "response must be 'recognized' or 'secure'" });

  const event = await db.securityEvent.findFirst({
    where: { id: req.params.id, account: { userId: req.userId } },
    include: { account: true },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });

  await db.securityEvent.update({ where: { id: event.id }, data: { status, respondedAt: new Date() } });
  res.json({ status, securityUrl: response === "secure" ? SECURITY_LINKS[event.account.platform] : undefined });
}
