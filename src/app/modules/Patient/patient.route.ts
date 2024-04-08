import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { patientController } from "./patient.controller";
import validateRequest from "../../middlewares/validateRequest";
import { patientValidations } from "./patient.validation";

const router = express.Router();

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	patientController.getAllPatient
);
router.get(
	"/:patientId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT),
	patientController.getSinglePatient
);
router.patch(
	"/:patientId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT),
	// validateRequest(patientValidations.updatePatientValidationSchema),
	patientController.updatePatient
);
router.delete(
	"/:patientId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	patientController.deletePatient
);
router.delete(
	"/soft/:patientId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	patientController.softDeletePatient
);

export const patientRoutes = router;
