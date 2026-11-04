import { db } from "../config/db.js";

export async function listDevices(req, res) {
  res.json(await db.trustedDevice.findMany({ where: { userId: req.userId } }));
}

export async function trustDevice(req, res) {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const { userId } = req;
  const device = await db.trustedDevice.upsert({
    where: { userId_name: { userId, name } },
    update: { type },
    create: { userId, name, type },
  });
  res.status(201).json(device);
}

export async function deleteDevice(req, res) {
  const { count } = await db.trustedDevice.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  if (!count) return res.status(404).json({ error: "Device not found" });
  res.sendStatus(204);
}
