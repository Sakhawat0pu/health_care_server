import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { metaServices } from "./meta.services";

const getMetaData = catchAsync(async (req: Request, res: Response) => {
	const result = await metaServices.getMetaDataFromD(req.user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Meta data have been retrieved successfully.",
		data: result,
	});
});

export const metaControllers = {
	getMetaData,
};
