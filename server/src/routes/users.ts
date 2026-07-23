import { Router } from "express";
import { getMeProfile, updateMeProfile, selfAssignMembership } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMeProfile);
router.patch("/me", requireAuth, updateMeProfile);
router.post("/me/memberships", requireAuth, selfAssignMembership);

export default router;
