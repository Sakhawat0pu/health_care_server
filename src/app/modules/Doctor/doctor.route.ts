import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { doctorController } from "./doctor.controller";

const router = express.Router();

router.get("/", doctorController.getAllDoctor);

router.get(
	"/:doctorId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	doctorController.getSingleDoctor
);

router.patch(
	"/:id",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	doctorController.updateDoctor
);

router.delete(
	"/:doctorId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	doctorController.deleteDoctor
);
router.delete(
	"/soft/:doctorId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	doctorController.softDeleteDoctor
);

export const doctorRoutes = router;
