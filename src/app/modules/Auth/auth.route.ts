import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

const router = express.Router();

router.post(
	"/login",
	validateRequest(authValidation.loginUserValidationSchema),
	authController.loginUser
);

export const authRoutes = router;
