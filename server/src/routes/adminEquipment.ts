import { Router } from "express";
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
} from "../controllers/adminEquipmentController.js";

const router = Router();

router.post("/", createEquipment);
router.patch("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);
router.post("/:id/status", updateEquipmentStatus);

export default router;
