import { Request, Response } from "express";
import { userServices } from "./user.services";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.createAdminIntoDb(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Admin has been created successfully",
		data: result,
	});
});

export const userController = {
	createAdmin,
};
