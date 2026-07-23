import { Router } from "express";
import { getEquipment, getEquipmentById } from "../controllers/equipmentController.js";

const router = Router();

router.get("/", getEquipment);
router.get("/:id", getEquipmentById);

export default router;
