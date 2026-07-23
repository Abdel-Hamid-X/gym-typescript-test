import { Router } from "express";
import { createContactMessage } from "../controllers/messageController.js";

const router = Router();

router.post("/", createContactMessage);

export default router;
