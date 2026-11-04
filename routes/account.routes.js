import { Router } from "express";
import { listAccounts, createAccount, deleteAccount } from "../controllers/account.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listAccounts);
router.post("/", createAccount);
router.delete("/:id", deleteAccount);

export default router;
