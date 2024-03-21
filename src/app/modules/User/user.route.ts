import express, { Request, Response } from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidation } from "../Admin/admin.validation";

const router = express.Router();

router.post(
	"/create-admin",
	validateRequest(adminValidation.createAdminValidationSchema),
	userController.createAdmin
);

export const userRoutes = router;
