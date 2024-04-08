import { Request, Response } from "express";
import { userServices } from "./user.services";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import pick from "../../shared/pick";
import { filterableUserFields } from "./user.constant";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.createAdminIntoDb(req);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Admin created successfully",
		data: result,
	});
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.createDoctorIntoDb(req);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Doctor created successfully",
		data: result,
	});
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.createPatientIntoDb(req);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Patient created successfully",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, filterableUserFields);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await userServices.getAllUserFromDb(query, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users have been retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
	const userId = req.params.id;
	const data = req.body;
	const result = await userServices.updateUserStatusIntoDb(userId, data);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User status has been updated successfully.",
		data: result,
	});
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.getMyProfileFromDb(req.user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My profile data fetched successfully.",
		data: result,
	});
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const result = await userServices.updateMyProfile(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My profile updated successfully.",
		data: result,
	});
});

export const userController = {
	createAdmin,
	createDoctor,
	createPatient,
	getAllUsers,
	updateUserStatus,
	getMyProfile,
	updateMyProfile,
};
