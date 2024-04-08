import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import { TQueryDoctorScheduleParams } from "./doctorSchedule.interface";
import { TPaginationOptions } from "../../interface/pagination";
import { Prisma } from "@prisma/client";
import calculatePagination from "../../utils/calculatePagination";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { boolean } from "zod";

const createDoctorScheduleIntoDb = async (
	userInfo: JwtPayload,
	payload: Record<string, any>
) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: userInfo.email,
		},
	});

	payload.scheduleIds.forEach(async (id: string) => {
		await prisma.schedule.findUniqueOrThrow({
			where: {
				id,
			},
		});
	});

	const doctorScheduleData = payload?.scheduleIds.map((id: string) => ({
		doctorId: doctorData.id,
		scheduleId: id,
	}));

	const result = await prisma.doctorSchedule.createMany({
		data: doctorScheduleData,
	});

	return result;
};

const getMyScheduleFromDb = async (
	params: any,
	options: TPaginationOptions,
	userInfo: JwtPayload
) => {
	const { startDateTime, endDateTime, ...filterData } = params;
	const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

	if (startDateTime && endDateTime) {
		andConditions.push({
			AND: [
				{
					schedule: {
						startDateTime: {
							gte: startDateTime,
						},
					},
				},
				{
					schedule: {
						endDateTime: {
							lte: endDateTime,
						},
					},
				},
			],
		});
	}

	if (Object.keys(filterData).length) {
		if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "true"
		) {
			filterData.isBooked = true;
		} else if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "false"
		) {
			filterData.isBooked = false;
		}
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: filterData[key],
				},
			})),
		});
	}

	const whereCondition: Prisma.DoctorScheduleWhereInput = {
		AND: andConditions,
	};
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

	let fieldUsedToSort = sortBy;
	if (sortBy === "createdAt") {
		fieldUsedToSort = "doctorId";
	}

	const result = await prisma.doctorSchedule.findMany({
		where: {
			doctor: {
				email: userInfo.email,
			},
			...whereCondition,
		},
		skip,
		take: limit,
		orderBy: {
			[fieldUsedToSort]: sortOrder,
		},
	});

	const totalDocuments = await prisma.doctorSchedule.count({
		//* total number of document may vary according to queries
		where: {
			doctor: {
				email: userInfo.email,
			},
			...whereCondition,
		},
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

const deleteMyScheduleFromDb = async (
	userInfo: JwtPayload,
	scheduleId: string
) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: userInfo.email,
		},
	});

	const isBookedSchedule = await prisma.doctorSchedule.findUnique({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: scheduleId,
			},
			isBooked: true,
		},
	});

	if (isBookedSchedule) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Appointed schedule can't be deleted"
		);
	}

	const result = await prisma.doctorSchedule.delete({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: scheduleId,
			},
		},
	});

	return result;
};

const getAllDoctorScheduleFromDb = async (
	params: TQueryDoctorScheduleParams,
	options: TPaginationOptions
) => {
	const { startDateTime, endDateTime, ...filterData } = params;

	const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

	if (startDateTime && endDateTime) {
		andConditions.push({
			AND: [
				{
					schedule: {
						startDateTime: {
							gte: startDateTime,
						},
					},
				},
				{
					schedule: {
						endDateTime: {
							lte: endDateTime,
						},
					},
				},
			],
		});
	}

	if (Object.keys(filterData).length) {
		if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "true"
		) {
			filterData.isBooked = true;
		} else if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "false"
		) {
			filterData.isBooked = false;
		}
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: filterData[key],
				},
			})),
		});
	}

	const whereCondition: Prisma.DoctorScheduleWhereInput = {
		AND: andConditions,
	};
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

	let fieldUsedToSort = sortBy;
	if (sortBy === "createdAt") {
		fieldUsedToSort = "doctorId";
	}

	const result = await prisma.doctorSchedule.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[fieldUsedToSort]: sortOrder,
		},
	});

	const totalDocuments = await prisma.doctorSchedule.count({
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

export const doctorScheduleServices = {
	createDoctorScheduleIntoDb,
	getMyScheduleFromDb,
	deleteMyScheduleFromDb,
	getAllDoctorScheduleFromDb,
};
