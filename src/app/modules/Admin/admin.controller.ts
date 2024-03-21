import { NextFunction, Request, Response } from "express";
import { adminServices } from "./admin.services";
import httpStatus from "http-status";
import pick from "../../shared/pick";
import { adminFilterableFields } from "./admin.constants";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, adminFilterableFields);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await adminServices.getAllAdminFromDb(query, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admins have been retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.params.adminId;
	const result = await adminServices.getSingleAdminFromDb(adminId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified admin has been retrieved successfully.",
		data: result,
	});
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.params.adminId;
	const updatedAdmin = req.body;
	const result = await adminServices.updateAdminIntoDb(adminId, updatedAdmin);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified admin has been updated successfully.",
		data: result,
	});
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.params.adminId;
	const result = await adminServices.deleteAdminFromDb(adminId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified admin has been deleted successfully.",
		data: result,
	});
});

const softDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.params.adminId;
	const result = await adminServices.softDeleteAdminFromDb(adminId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified admin has been deleted successfully.",
		data: result,
	});
});

export const adminController = {
	getAllAdmin,
	getSingleAdmin,
	updateAdmin,
	deleteAdmin,
	softDeleteAdmin,
};
