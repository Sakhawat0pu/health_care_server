import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { adminRoutes } from "../modules/Admin/admin.route";
import { authRoutes } from "../modules/Auth/auth.route";
import { specialtiesRoutes } from "../modules/Specialties/specialties.route";
import { doctorRoutes } from "../modules/Doctor/doctor.route";
import { patientRoutes } from "../modules/Patient/patient.route";
import { scheduleRoutes } from "../modules/Schedule/schedule.route";
import { doctorScheduleRoutes } from "../modules/DoctorSchedule/doctorSchedule.route";
import { appointmentRoutes } from "../modules/Appointment/appointment.route";
import { paymentRouter } from "../modules/Payment/payment.route";
import { prescriptionRouter } from "../modules/Prescription/prescription.route";
import { reviewRoutes } from "../modules/Review/review.route";
import { metaRoutes } from "../modules/Meta/meta.route";

const router = express.Router();

const allRoutes = [
	{
		path: "/user",
		route: userRoutes,
	},
	{
		path: "/admin",
		route: adminRoutes,
	},
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/specialties",
		route: specialtiesRoutes,
	},
	{
		path: "/doctor",
		route: doctorRoutes,
	},
	{
		path: "/patient",
		route: patientRoutes,
	},
	{
		path: "/schedule",
		route: scheduleRoutes,
	},
	{
		path: "/doctor-schedule",
		route: doctorScheduleRoutes,
	},
	{
		path: "/appointment",
		route: appointmentRoutes,
	},
	{
		path: "/payment",
		route: paymentRouter,
	},
	{
		path: "/prescription",
		route: prescriptionRouter,
	},
	{
		path: "/review",
		route: reviewRoutes,
	},
	{
		path: "/meta-data",
		route: metaRoutes,
	},
];

allRoutes.forEach((rt) => router.use(rt.path, rt.route));

export default router;
