import { createServer } from "http";
import express from "express";
import cors from "cors"; 

import { errorHandler } from "./middleware/error.js";
import { attachRealtime } from "./services/realtime.js";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import eventRoutes from "./routes/event.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// ✅ FULL FIX: The npm package must be invoked with ().
// This logic automatically allows your CLIENT_URL, any Vercel preview link, and localhost.
app.use(cors({
  origin: function (origin, callback) {
    const allowed = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/$/, "") : "";
    
    if (
      !origin || // Allow tools like Postman
      origin === allowed || 
      origin.endsWith(".vercel.app") || 
      origin.startsWith("http://localhost:")
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
// Routes
app.get("/health", (req, res) => res.json({ ok: true }));

// Add /api/v1 prefix to ALL routes so they match the frontend's API_BASE_URL
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use(errorHandler);

const server = createServer(app);
attachRealtime(server);

const port = process.env.PORT ?? 4000;
server.listen(port, () => console.log(`Guardian API running on port ${port}`));