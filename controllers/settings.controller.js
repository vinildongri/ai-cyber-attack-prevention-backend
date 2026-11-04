import { db } from "../config/db.js";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function getSettings(req, res) {
  res.json(await db.userSettings.findUnique({ where: { userId: req.userId } }));
}

export async function updateSettings(req, res) {
  const { sleepMode, sleepStart, sleepEnd } = req.body;
  if ([sleepStart, sleepEnd].some((t) => t !== undefined && !HHMM.test(t))) {
    return res.status(400).json({ error: "Times must be in HH:MM (24h) format" });
  }

  res.json(
    await db.userSettings.update({
      where: { userId: req.userId },
      data: { sleepMode, sleepStart, sleepEnd },
    })
  );
}
