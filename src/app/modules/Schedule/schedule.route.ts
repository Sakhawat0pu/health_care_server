import express from "express";
import { scheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	scheduleController.createSchedule
);

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	scheduleController.getAllSchedule
);
router.get(
	"/:scheduleId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	scheduleController.getASchedule
);

router.delete(
	"/:scheduleId",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	scheduleController.deleteSchedule
);

export const scheduleRoutes = router;
