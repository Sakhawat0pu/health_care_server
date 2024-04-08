import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidation } from "../Admin/admin.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../utils/sendImageToCloudinary";
import { doctorValidation } from "../Doctor/doctor.validation";
import { patientValidations } from "../Patient/patient.validation";
import { userValidations } from "./user.validation";

const router = express.Router();

router.get(
	"/me",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
	userController.getMyProfile
);

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	userController.getAllUsers
);

router.post(
	"/create-admin",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		next();
	},
	validateRequest(adminValidation.createAdminValidationSchema),
	userController.createAdmin
);

router.post(
	"/create-doctor",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		next();
	},
	validateRequest(doctorValidation.createDoctorValidationSchema),
	userController.createDoctor
);

router.post(
	"/create-patient",
	upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		next();
	},
	validateRequest(patientValidations.createPatientValidationSchema),
	userController.createPatient
);

router.patch(
	"/:id/status",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	validateRequest(userValidations.updateStatusValidationSchema),
	userController.updateUserStatus
);

router.patch(
	"/me",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
	upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		next();
	},
	userController.updateMyProfile
);

export const userRoutes = router;
