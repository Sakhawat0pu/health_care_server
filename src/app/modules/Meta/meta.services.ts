import { Doctor, PaymentStatus, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";

const getMetaDataFromD = async (userInfo: JwtPayload) => {
	let metaData = {};
	switch (userInfo.role) {
		case UserRole.SUPER_ADMIN:
			metaData = getSuperAdminMetaData();
			break;
		case UserRole.ADMIN:
			metaData = getAdminMetaData();
			break;
		case UserRole.DOCTOR:
			metaData = getDoctorMetaData(userInfo);
			break;
		case UserRole.PATIENT:
			metaData = getPatientMetaData(userInfo);
			break;
		default:
			throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user role");
	}

	return metaData;
};

const getSuperAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count();
	const patientCount = await prisma.patient.count();
	const doctorCount = await prisma.doctor.count();
	const adminCount = await prisma.admin.count();
	const paymentCount = await prisma.payment.count();
	const totalRevenue = await prisma.payment.aggregate({
		where: {
			paymentStatus: PaymentStatus.PAID,
		},
		_sum: {
			amount: true,
		},
	});

	const barChartData = await getBarChartData();
	const pieChartData = await getPieChartData();

	return {
		appointmentCount,
		adminCount,
		patientCount,
		doctorCount,
		paymentCount,
		totalRevenue: totalRevenue._sum.amount,
		barChartData,
		pieChartData,
	};
};
const getAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count();
	const patientCount = await prisma.patient.count();
	const doctorCount = await prisma.doctor.count();
	const paymentCount = await prisma.payment.count();

	const totalRevenue = await prisma.payment.aggregate({
		where: {
			paymentStatus: PaymentStatus.PAID,
		},
		_sum: {
			amount: true,
		},
	});

	const barChartData = await getBarChartData();
	const pieChartData = await getPieChartData();

	return {
		appointmentCount,
		patientCount,
		doctorCount,
		paymentCount,
		totalRevenue: totalRevenue._sum.amount,
		barChartData,
		pieChartData,
	};
};
const getDoctorMetaData = async (doctorInfo: JwtPayload) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: doctorInfo.email,
		},
	});

	const appointmentCount = await prisma.appointment.count({
		where: {
			doctorId: doctorData.id,
		},
	});

	const patientCount: Array<Record<string, number>> =
		await prisma.$queryRaw`SELECT COUNT(DISTINCT("patientId"))::int FROM "Appointment" where "doctorId"=${doctorData.id}`;

	const reviewCount = await prisma.review.count({
		where: {
			doctorId: doctorData.id,
		},
	});

	const totalRevenue = await prisma.payment.aggregate({
		where: {
			appointment: {
				doctorId: doctorData.id,
			},
			paymentStatus: PaymentStatus.PAID,
		},
		_sum: { amount: true },
	});

	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		where: {
			doctorId: doctorData.id,
		},
		_count: {
			id: true,
		},
	});

	const formattedAppointmentStatusDistribution =
		appointmentStatusDistribution.map((dist) => ({
			status: dist.status,
			count: dist._count.id,
		}));

	return {
		appointmentCount,
		patientCount: patientCount[0].count,
		reviewCount,
		totalRevenue: totalRevenue._sum.amount,
		appointmentStatusDistribution: formattedAppointmentStatusDistribution,
	};
};
const getPatientMetaData = async (patientInfo: JwtPayload) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: patientInfo.email,
		},
	});

	const appointmentCount = await prisma.appointment.count({
		where: {
			patientId: patientData.id,
		},
	});

	const prescriptionCount = await prisma.prescription.count({
		where: {
			patientId: patientData.id,
		},
	});

	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		where: {
			patientId: patientData.id,
		},
		_count: {
			id: true,
		},
	});

	const formattedAppointmentStatusDistribution =
		appointmentStatusDistribution.map((dist) => ({
			status: dist.status,
			count: dist._count.id,
		}));

	return {
		appointmentCount,
		prescriptionCount,
		appointmentStatusDistribution: formattedAppointmentStatusDistribution,
	};
};

const getBarChartData = async () => {
	const appointmentCountByMonth = await prisma.$queryRaw`
		SELECT DATE_TRUNC('month', "createdAt") as month,
		CAST(COUNT(*) AS INTEGER) as appointmentCount
		FROM "Appointment"
		GROUP BY month
		ORDER BY month ASC
	`;

	return appointmentCountByMonth;
};

const getPieChartData = async () => {
	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: {
			id: true,
		},
	});

	const formattedAppointmentStatusDistribution =
		appointmentStatusDistribution.map((dist) => ({
			status: dist.status,
			appointmentCount: dist._count.id,
		}));

	return formattedAppointmentStatusDistribution;
};
export const metaServices = {
	getMetaDataFromD,
};
