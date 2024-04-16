import { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../shared/prisma";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";
import {
	AppointmentStatus,
	PaymentStatus,
	Prisma,
	UserRole,
} from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createAppointmentIntoDb = async (
	patientInfo: JwtPayload,
	payload: Record<string, any>
) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: patientInfo.email,
			isDeleted: false,
		},
	});

	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			id: payload.doctorId,
		},
	});

	const doctorScheduleData = await prisma.doctorSchedule.findUniqueOrThrow({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: payload.scheduleId,
			},
			isBooked: false,
		},
	});

	const videoCallingId = uuidv4();

	const result = await prisma.$transaction(async (client) => {
		const appointmentData = await client.appointment.create({
			data: {
				patientId: patientData.id,
				doctorId: doctorData.id,
				scheduleId: doctorScheduleData.scheduleId,
				videoCallingId: videoCallingId,
			},
			include: {
				patient: true,
				doctor: true,
				schedule: true,
			},
		});

		await client.doctorSchedule.update({
			where: {
				doctorId_scheduleId: {
					doctorId: doctorData.id,
					scheduleId: payload.scheduleId,
				},
				isBooked: false,
			},
			data: {
				isBooked: true,
				appointmentId: appointmentData.id,
			},
		});

		const today = new Date();
		const transactionId =
			"online-healthcare-" +
			today.getFullYear() +
			"-" +
			today.getMonth() +
			"-" +
			today.getDate() +
			"-" +
			today.getHours() +
			"-" +
			today.getMinutes() +
			"-" +
			today.getSeconds();

		await client.payment.create({
			data: {
				appointmentId: appointmentData.id,
				amount: doctorData.appointmentFee,
				transactionId: transactionId,
			},
		});

		return appointmentData;
	});

	return result;
};

const getMyAppointmentsFromDb = async (
	userInfo: JwtPayload,
	filterData: Record<string, unknown>,
	options: TPaginationOptions
) => {
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const andConditions: Prisma.AppointmentWhereInput[] = [];

	if (userInfo.role === UserRole.PATIENT) {
		andConditions.push({
			patient: {
				email: userInfo.email,
			},
		});
	}

	if (userInfo.role === UserRole.DOCTOR) {
		andConditions.push({
			doctor: {
				email: userInfo.email,
			},
		});
	}

	if (Object.keys(filterData).length) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: filterData[key],
				},
			})),
		});
	}

	const whereCondition: Prisma.AppointmentWhereInput = { AND: andConditions };

	const result = await prisma.appointment.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include:
			userInfo.role === UserRole.PATIENT
				? {
						doctor: true,
						schedule: true,
					}
				: {
						patient: {
							include: {
								patientHealthData: true,
								medicalReport: true,
							},
						},
						schedule: true,
					},
	});

	const totalDocuments = await prisma.appointment.count({
		//* total number of document may vary according to queries
		where: whereCondition,
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

const getAllAppointmentsFromDb = async (
	filterData: Record<string, unknown>,
	options: TPaginationOptions
) => {
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const andConditions: Prisma.AppointmentWhereInput[] = [];

	if (Object.keys(filterData).length) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: filterData[key],
				},
			})),
		});
	}

	const whereCondition: Prisma.AppointmentWhereInput = { AND: andConditions };

	const result = await prisma.appointment.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			doctor: true,
			patient: true,
			schedule: true,
		},
	});

	const totalDocuments = await prisma.appointment.count({
		//* total number of document may vary according to queries
		where: whereCondition,
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

const changeAppointmentStatusFromDb = async (
	id: string,
	userInfo: JwtPayload,
	payload: { status: AppointmentStatus }
) => {
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id,
		},
		include: {
			doctor: true,
		},
	});

	if (
		userInfo.role === UserRole.DOCTOR &&
		userInfo.email !== appointmentData.doctor.email
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to change the status of another doctor's appointment."
		);
	}

	const result = await prisma.appointment.update({
		where: {
			id: appointmentData.id,
		},
		data: payload,
	});

	return result;
};

const cancelUnpaidAppointments = async () => {
	const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

	const unpaidAppointments = await prisma.appointment.findMany({
		where: {
			paymentStatus: PaymentStatus.UNPAID,
			createdAt: {
				lte: thirtyMinutesAgo,
			},
		},
	});

	const appointmentsToBeCancelled = unpaidAppointments.map(
		(appointments) => appointments.id
	);

	await prisma.$transaction(async (client) => {
		await client.payment.deleteMany({
			where: {
				appointmentId: {
					in: appointmentsToBeCancelled,
				},
			},
		});

		await client.appointment.deleteMany({
			where: {
				id: {
					in: appointmentsToBeCancelled,
				},
			},
		});

		for (const appointment of unpaidAppointments) {
			await client.doctorSchedule.update({
				where: {
					doctorId_scheduleId: {
						doctorId: appointment.doctorId,
						scheduleId: appointment.scheduleId,
					},
				},
				data: {
					isBooked: false,
				},
			});
		}
	});
};

export const appointmentServices = {
	createAppointmentIntoDb,
	getMyAppointmentsFromDb,
	getAllAppointmentsFromDb,
	changeAppointmentStatusFromDb,
	cancelUnpaidAppointments,
};
