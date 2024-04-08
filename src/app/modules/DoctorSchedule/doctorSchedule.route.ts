import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { doctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.post(
	"/",
	auth(UserRole.DOCTOR),
	doctorScheduleController.createDoctorSchedule
);

router.get(
	"/my-schedule",
	auth(UserRole.DOCTOR),
	doctorScheduleController.getMySchedule
);

router.get(
	"/",
	auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT, UserRole.SUPER_ADMIN),
	doctorScheduleController.getAllDoctorSchedule
);

router.delete(
	"/:scheduleId",
	auth(UserRole.DOCTOR),
	doctorScheduleController.deleteMySchedule
);

export const doctorScheduleRoutes = router;
