import { Router } from "express";
import { getCoaches, getCoachById } from "../controllers/coachController.js";

const router = Router();

router.get("/", getCoaches);
router.get("/:id", getCoachById);

export default router;
