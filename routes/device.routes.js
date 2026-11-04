import { Router } from "express";
import { listDevices, trustDevice, deleteDevice } from "../controllers/device.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listDevices);
router.post("/", trustDevice);
router.delete("/:id", deleteDevice);

export default router;
