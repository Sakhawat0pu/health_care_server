import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../shared/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";
import { JwtPayload } from "jsonwebtoken";
import { TQueryScheduleParams } from "./schedule.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const intervalTime = 30;

const createScheduleIntoDb = async (
	payload: Record<string, any>
): Promise<Schedule[]> => {
	const { startDate, endDate, startTime, endTime } = payload;

	const dateStart = new Date(startDate);
	const dateEnd = new Date(endDate);

	const schedule = [];

	while (dateStart <= dateEnd) {
		const periodStartsAt = new Date(
			addMinutes(
				addHours(
					`${format(dateStart, "yyyy-MM-dd")}`,
					Number(startTime.split(":")[0])
				),
				Number(startTime.split(":")[1])
			)
		);

		const periodEndsAt = new Date(
			addMinutes(
				addHours(
					`${format(dateStart, "yyyy-MM-dd")}`,
					Number(endTime.split(":")[0])
				),
				Number(endTime.split(":")[1])
			)
		);

		while (periodStartsAt < periodEndsAt) {
			const singleSlotData = {
				startDateTime: periodStartsAt,
				endDateTime: addMinutes(periodStartsAt, intervalTime),
			};

			const scheduleExists = await prisma.schedule.findFirst({
				where: {
					startDateTime: singleSlotData.startDateTime,
					endDateTime: singleSlotData.endDateTime,
				},
			});

			if (!scheduleExists) {
				const result = await prisma.schedule.create({
					data: singleSlotData,
				});

				schedule.push(result);
			}

			periodStartsAt.setMinutes(periodStartsAt.getMinutes() + intervalTime);
		}

		dateStart.setDate(dateStart.getDate() + 1);
	}

	return schedule;
};

const getAllScheduleFromDb = async (
	params: TQueryScheduleParams,
	options: TPaginationOptions,
	userInfo: JwtPayload
) => {
	const { startDateTime, endDateTime, ...filterData } = params;
	const andConditions: Prisma.ScheduleWhereInput[] = [];

	if (startDateTime && endDateTime) {
		andConditions.push({
			AND: [
				{
					startDateTime: {
						gte: startDateTime,
					},
				},
				{
					endDateTime: {
						lte: endDateTime,
					},
				},
			],
		});
	}

	// if (Object.keys(filterData).length) {
	// 	andConditions.push({
	// 		AND: Object.keys(filterData).map((key) => ({
	// 			[key]: {
	// 				equals: filterData[key],
	// 			},
	// 		})),
	// 	});
	// }

	const whereCondition: Prisma.ScheduleWhereInput = { AND: andConditions };
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

	const doctorSchedules = await prisma.doctorSchedule.findMany({
		where: {
			doctor: {
				email: userInfo.email,
			},
		},
	});

	const doctorScheduleIds = doctorSchedules.map(
		(schedules) => schedules.scheduleId
	);

	const result = await prisma.schedule.findMany({
		where: {
			...whereCondition,
			id: {
				notIn: doctorScheduleIds,
			},
		},
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
	});

	const totalDocuments = await prisma.schedule.count({
		//* total number of document may vary according to queries
		where: {
			...whereCondition,
			id: {
				notIn: doctorScheduleIds,
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

const getAScheduleFromDb = async (scheduleId: string) => {
	const result = await prisma.schedule.findUniqueOrThrow({
		where: {
			id: scheduleId,
		},
	});
	return result;
};

const deleteAScheduleFromDb = async (scheduleId: string) => {
	await prisma.schedule.findUniqueOrThrow({
		where: {
			id: scheduleId,
		},
	});

	const result = await prisma.$transaction(async (client) => {
		const isBookedSchedule = await client.doctorSchedule.findFirst({
			where: {
				scheduleId: scheduleId,
				isBooked: true,
			},
		});

		if (isBookedSchedule) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Appointed schedule can't be deleted"
			);
		}
		await client.doctorSchedule.deleteMany({
			where: {
				scheduleId: scheduleId,
				isBooked: false,
			},
		});
		const deletedScheduleData = await client.schedule.delete({
			where: {
				id: scheduleId,
			},
		});

		return deletedScheduleData;
	});

	return result;
};

export const scheduleServices = {
	createScheduleIntoDb,
	getAScheduleFromDb,
	getAllScheduleFromDb,
	deleteAScheduleFromDb,
};
