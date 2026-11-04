import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const publicUser = ({ id, name, email }) => ({ id, name, email });

function startSession(res, user, status = 200) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(status).cookie("token", token, cookieOptions).json({ user: publicUser(user), token });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !(password?.length >= 8)) {
    return res.status(400).json({ error: "name, email and a password of 8+ characters are required" });
  }
  if (await db.user.findUnique({ where: { email } })) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12), settings: { create: {} } },
  });
  startSession(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await db.user.findUnique({ where: { email: String(email) } });
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  startSession(res, user);
}

export function logout(_req, res) {
  res.clearCookie("token", cookieOptions).sendStatus(204);
}

export async function me(req, res) {
  const user = await db.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: publicUser(user) });
}
