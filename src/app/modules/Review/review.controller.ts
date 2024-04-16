import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewServices } from "./review.services";
import pick from "../../shared/pick";
import { filterableReviewFields } from "./review.constants";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
	const result = await reviewServices.createReviewIntoDb(req.user, req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Review created successfully.",
		data: result,
	});
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
	const params = pick(req.query, filterableReviewFields);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await reviewServices.getAllReviewsFromDb(params, options);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reviews retrieved successfully.",
		data: result,
	});
});

export const reviewController = {
	createPrescription,
	getAllReviews,
};
