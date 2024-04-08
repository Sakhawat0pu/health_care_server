import express from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = express.Router();

router.post(
	"/",
	auth(UserRole.PATIENT),
	validateRequest(appointmentValidation.createAppointmentValidationSchema),
	appointmentController.createAppointment
);

export const appointmentRoutes = router;