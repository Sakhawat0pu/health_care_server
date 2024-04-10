import { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../shared/prisma";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";
import { Prisma, UserRole } from "@prisma/client";

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

export const appointmentServices = {
	createAppointmentIntoDb,
	getMyAppointmentsFromDb,
	getAllAppointmentsFromDb,
};
