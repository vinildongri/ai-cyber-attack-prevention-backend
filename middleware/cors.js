const allowed = (process.env.CLIENT_URL ?? "").split(",").map((o) => o.trim());

export function cors(req, res, next) {
  const { origin } = req.headers;

  if (allowed.includes(origin)) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      Vary: "Origin",
    });
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}