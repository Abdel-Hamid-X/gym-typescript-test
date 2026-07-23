import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  getUserMemberships,
  assignMembership,
  cancelMembership,
  extendMembership,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import adminEquipmentRouter from "./adminEquipment.js";
import { uploadImage } from "../controllers/adminEquipmentController.js";
import { upload } from "../utils/upload.js";
import { createCoach, updateCoachProfileByAdmin } from "../controllers/adminCoachController.js";
import {
  createClass,
  updateClass,
  deleteClass,
  assignCoachToClass,
  createScheduleByAdmin,
  updateScheduleByAdmin,
  deleteScheduleByAdmin,
} from "../controllers/adminClassController.js";
import {
  getContactMessages,
  getMessageById,
  updateMessageStatus,
  deleteContactMessage,
} from "../controllers/adminMessageController.js";

const router = Router();

// Secure all admin routes
router.use(requireAuth, requireRole(Role.ADMIN));

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.post("/users/:id/deactivate", deactivateUser);
router.post("/users/:id/reactivate", reactivateUser);

// Manual Membership Management
router.get("/users/:userId/memberships", getUserMemberships);
router.post("/users/:userId/memberships", assignMembership);
router.post("/memberships/:id/cancel", cancelMembership);
router.post("/memberships/:id/extend", extendMembership);

// Equipment & Inventory Management
router.use("/equipment", adminEquipmentRouter);
router.post("/uploads", upload.single("image"), uploadImage);

// Coach Management
router.post("/coaches", createCoach);
router.patch("/coaches/:id/profile", updateCoachProfileByAdmin);

// Class & Schedule Management
router.post("/classes", createClass);
router.patch("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);
router.put("/classes/:id/coach", assignCoachToClass);
router.post("/classes/:classId/schedules", createScheduleByAdmin);
router.patch("/schedules/:scheduleId", updateScheduleByAdmin);
router.delete("/schedules/:scheduleId", deleteScheduleByAdmin);

// Contact Inbox Management
router.get("/contact-messages", getContactMessages);
router.get("/contact-messages/:id", getMessageById);
router.patch("/contact-messages/:id/status", updateMessageStatus);
router.delete("/contact-messages/:id", deleteContactMessage);

export default router;
