import { createServer } from "http";
import express from "express";
import { cors } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error.js";
import { attachRealtime } from "./services/realtime.js";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import eventRoutes from "./routes/event.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// 1. Fix Custom CORS: Pass the function reference directly without invoking it with ()
app.use(cors);

// 2. Parse JSON bodies (removed the duplicate entry you had below)
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 3. Routes (Removed the duplicate "/auth" route so it doesn't conflict with "/api/v1/auth")
app.use('/api/v1/auth', authRoutes);
app.use("/accounts", accountRoutes);
app.use("/events", eventRoutes);
app.use("/devices", deviceRoutes);
app.use("/settings", settingsRoutes);
app.use("/chat", chatRoutes);

// Error Handler
app.use(errorHandler);

const server = createServer(app);
attachRealtime(server);

const port = process.env.PORT ?? 4000;
server.listen(port, () => console.log(`Guardian API running on port ${port}`));