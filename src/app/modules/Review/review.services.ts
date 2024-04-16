import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import { Prisma, Review } from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";
import { equal } from "assert";

const createReviewIntoDb = async (patientInfo: JwtPayload, payload: Review) => {
	const appointmentInfo = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
		},
		include: {
			patient: true,
		},
	});

	if (patientInfo.email !== appointmentInfo.patient.email) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You can only leave a review for your own appointment"
		);
	}

	payload.doctorId = appointmentInfo.doctorId;
	payload.patientId = appointmentInfo.patientId;

	const result = await prisma.$transaction(async (client) => {
		const createdReviewData = await client.review.create({
			data: payload,
		});

		const averageRatings = await client.review.groupBy({
			by: "doctorId",
			_avg: {
				rating: true,
			},
		});

		const doctorAvgRating = averageRatings.filter(
			(rating) => rating.doctorId === createdReviewData.doctorId
		);

		await client.doctor.update({
			where: {
				id: createdReviewData.doctorId,
			},
			data: {
				averageRating: doctorAvgRating[0]._avg.rating as number,
			},
		});

		return createdReviewData;
	});

	return result;
};

const getAllReviewsFromDb = async (
	filterData: { patientEmail?: string; doctorEmail?: string },
	options: TPaginationOptions
) => {
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

	const andConditions: Prisma.ReviewWhereInput[] = [];

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

	const whereCondition: Prisma.ReviewWhereInput = { AND: andConditions };

	const result = await prisma.review.findMany({
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

	const totalDocuments = await prisma.review.count({
		where: whereCondition,
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

export const reviewServices = {
	createReviewIntoDb,
	getAllReviewsFromDb,
};
