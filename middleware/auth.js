import jwt from "jsonwebtoken";
import { parse } from "cookie";

// Accepts the httpOnly cookie (web) or a Bearer token (Android companion).
export function userIdFromRequest(req) {
  const bearer = req.headers.authorization?.replace("Bearer ", "");
  const token = bearer ?? parse(req.headers.cookie ?? "").token;
  try {
    return jwt.verify(token, process.env.JWT_SECRET).sub;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const userId = userIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}
