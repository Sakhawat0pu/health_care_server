import express from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = express.Router();

router.get(
	"/my-appointments",
	auth(UserRole.PATIENT, UserRole.DOCTOR),
	appointmentController.getMyAppointments
);

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	appointmentController.getAllAppointments
);

router.post(
	"/",
	auth(UserRole.PATIENT),
	validateRequest(appointmentValidation.createAppointmentValidationSchema),
	appointmentController.createAppointment
);

router.patch(
	"/status/:appointmentId",
	auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SUPER_ADMIN),
	appointmentController.changeAppointmentStatus
);

export const appointmentRoutes = router;
