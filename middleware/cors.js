const allowed = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

export function cors(req, res, next) {
  const { origin } = req.headers;

  if (origin && allowed.includes(origin)) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      Vary: "Origin",
    });
  } else if (origin) {
    console.warn("CORS blocked origin:", origin, "allowed:", allowed);
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}