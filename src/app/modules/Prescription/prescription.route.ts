import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { prescriptionController } from "./prescription.controller";

const router = express.Router();

router.get(
	"/my-prescription",
	auth(UserRole.PATIENT),
	prescriptionController.getMyPrescription
);

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	prescriptionController.getAllPrescriptions
);

router.post(
	"/",
	auth(UserRole.DOCTOR),
	prescriptionController.createPrescription
);

export const prescriptionRouter = router;
