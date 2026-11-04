import { Router } from "express";
import { listEvents, createEvent, respondToEvent } from "../controllers/event.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listEvents);
router.post("/", createEvent);
router.post("/:id/respond", respondToEvent);

export default router;
