import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidation } from "./admin.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
	"/",
	// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),d
	adminController.getAllAdmin
);
router.get(
	"/:adminId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminController.getSingleAdmin
);
router.patch(
	"/:adminId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	validateRequest(adminValidation.updateAdminValidationSchema),
	adminController.updateAdmin
);
router.delete(
	"/:adminId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminController.deleteAdmin
);
router.delete(
	"/soft/:adminId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminController.softDeleteAdmin
);

export const adminRoutes = router;
