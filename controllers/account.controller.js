import { db } from "../config/db.js";

export async function listAccounts(req, res) {
  res.json(await db.connectedAccount.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "asc" } }));
}

export async function createAccount(req, res) {
  const { platform, username } = req.body;
  if (!platform || !username) return res.status(400).json({ error: "platform and username are required" });

  const account = await db.connectedAccount.create({
    data: { userId: req.userId, platform: platform.toLowerCase(), username },
  });
  res.status(201).json(account);
}

export async function deleteAccount(req, res) {
  const { count } = await db.connectedAccount.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  if (!count) return res.status(404).json({ error: "Account not found" });
  res.sendStatus(204);
}
