import {
	AppointmentStatus,
	PaymentStatus,
	Prescription,
	Prisma,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";

const createPrescriptionIntoDb = async (
	doctorInfo: JwtPayload,
	payload: Prescription
) => {
	const appointmentInfo = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
			status: AppointmentStatus.COMPLETED,
			paymentStatus: PaymentStatus.PAID,
		},
		include: {
			doctor: true,
		},
	});

	if (doctorInfo.email !== appointmentInfo.doctor.email) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to create a prescription for another doctor's appointment"
		);
	}

	payload.doctorId = appointmentInfo.doctorId;
	payload.patientId = appointmentInfo.patientId;

	const result = await prisma.prescription.create({
		data: payload,
		include: {
			patient: true,
		},
	});

	return result;
};

const getMyPrescriptionFromDb = async (
	patientInfo: JwtPayload,
	options: TPaginationOptions
) => {
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const result = await prisma.prescription.findMany({
		where: {
			patient: {
				email: patientInfo.email,
			},
		},
		skip: skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			doctor: true,
			patient: true,
			appointment: true,
		},
	});

	const totalDocuments = await prisma.prescription.count({
		where: {
			patient: {
				email: patientInfo.email,
			},
		},
	});

	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

const getAllPrescriptions = async (
	filterData: { patientEmail?: string; doctorEmail?: string },
	options: TPaginationOptions
) => {
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

	const andConditions: Prisma.PrescriptionWhereInput[] = [];

	if (Object.keys(filterData).length) {
		if (filterData.patientEmail) {
			andConditions.push({
				patient: { email: { equals: filterData["patientEmail"] } },
			});
		}
		if (filterData.doctorEmail) {
			andConditions.push({
				doctor: { email: { equals: filterData["doctorEmail"] } },
			});
		}
	}

	const whereCondition: Prisma.PrescriptionWhereInput = { AND: andConditions };

	const result = await prisma.prescription.findMany({
		where: whereCondition,
		skip: skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},

		include: {
			doctor: true,
			patient: true,
			appointment: true,
		},
	});

	const totalDocuments = await prisma.prescription.count({
		where: whereCondition,
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};
export const prescriptionServices = {
	createPrescriptionIntoDb,
	getMyPrescriptionFromDb,
	getAllPrescriptions,
};
