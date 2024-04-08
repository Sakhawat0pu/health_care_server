import { Request, Response } from "express";
import httpStatus from "http-status";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { filterablePatientFields } from "./patient.constants";
import { patientServices } from "./patient.services";

const getAllPatient = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, filterablePatientFields);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await patientServices.getAllPatientsFromDb(query, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Patients have been retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const getSinglePatient = catchAsync(async (req: Request, res: Response) => {
	const patientId = req.params.patientId;
	const result = await patientServices.getSinglePatientFromDb(patientId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified patient has been retrieved successfully.",
		data: result,
	});
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
	const patientId = req.params.patientId;
	const updatedPatient = req.body;
	const result = await patientServices.updatePatientIntoDb(
		patientId,
		updatedPatient
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified patient has been updated successfully.",
		data: result,
	});
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
	const patientId = req.params.patientId;
	const result = await patientServices.deletePatientFromDb(patientId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified patient has been deleted successfully.",
		data: result,
	});
});

const softDeletePatient = catchAsync(async (req: Request, res: Response) => {
	const patientId = req.params.patientId;
	const result = await patientServices.softDeletePatientFromDb(patientId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified patient has been deleted successfully.",
		data: result,
	});
});

export const patientController = {
	getAllPatient,
	getSinglePatient,
	updatePatient,
	deletePatient,
	softDeletePatient,
};
