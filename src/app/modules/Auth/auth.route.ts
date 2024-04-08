import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
	"/login",
	validateRequest(authValidation.loginUserValidationSchema),
	authController.loginUser
);

router.post(
	"/refresh-token",
	validateRequest(authValidation.refreshTokenValidationSchema),
	authController.refreshToken
);

router.post(
	"/change-password",
	auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
	validateRequest(authValidation.changePasswordValidationSchema),
	authController.changePassword
);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

export const authRoutes = router;
