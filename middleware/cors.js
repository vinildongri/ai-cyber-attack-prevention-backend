export function cors(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": process.env.CLIENT_URL,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  });
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}
