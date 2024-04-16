import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import pick from "../../shared/pick";
import { prescriptionServices } from "./prescription.services";
import { filterablePrescriptionFields } from "./prescription.constant";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
	const result = await prescriptionServices.createPrescriptionIntoDb(
		req.user,
		req.body
	);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Prescription created successfully.",
		data: result,
	});
});

const getMyPrescription = catchAsync(async (req: Request, res: Response) => {
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await prescriptionServices.getMyPrescriptionFromDb(
		req.user,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Prescription retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const params = pick(req.query, filterablePrescriptionFields);
	const result = await prescriptionServices.getAllPrescriptions(
		params,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All prescriptions retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

export const prescriptionController = {
	createPrescription,
	getMyPrescription,
	getAllPrescriptions,
};
