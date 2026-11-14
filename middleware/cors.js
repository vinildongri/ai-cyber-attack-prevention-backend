const allowed = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

export function cors(req, res, next) {
  const { origin } = req.headers;

  // Allow if it matches Render env variable OR is a Vercel URL OR localhost
  const isAllowed = origin && (
    allowed.includes(origin) || 
    origin.endsWith(".vercel.app") || 
    origin.startsWith("http://localhost:")
  );

  if (isAllowed) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Vary": "Origin",
    });
  } else if (origin) {
    // If it still fails, check Render logs to see exactly what strings mismatched
    console.warn("CORS blocked origin:", origin, "allowed:", allowed);
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  
  next();
}