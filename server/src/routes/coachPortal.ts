import { Router } from "express";
import {
  getMyAssignedClasses,
  updateMyCoachProfile,
  createScheduleForMyClass,
  updateScheduleForMyClass,
  deleteScheduleForMyClass,
} from "../controllers/coachPortalController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(requireAuth, requireRole(Role.COACH));

router.get("/classes", getMyAssignedClasses);
router.patch("/me", updateMyCoachProfile);
router.post("/classes/:classId/schedules", createScheduleForMyClass);
router.patch("/schedules/:scheduleId", updateScheduleForMyClass);
router.delete("/schedules/:scheduleId", deleteScheduleForMyClass);

export default router;
