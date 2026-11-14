import { createServer } from "http";
import express from "express";

// ❌ DELETE THIS LINE: import { cors } from "./middleware/cors.js";
// ✅ ADD THIS LINE:
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

// ✅ ADD THIS OFFICIAL CORS CONFIGURATION
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.get("/health", (req, res) => res.json({ ok: true }));
app.use('/api/v1/auth', authRoutes);
app.use("/accounts", accountRoutes);
app.use("/events", eventRoutes);
app.use("/devices", deviceRoutes);
app.use("/settings", settingsRoutes);
app.use("/chat", chatRoutes);

app.use(errorHandler);

const server = createServer(app);
attachRealtime(server);

const port = process.env.PORT ?? 4000;
server.listen(port, () => console.log(`Guardian API running on port ${port}`));