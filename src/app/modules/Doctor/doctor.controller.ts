import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { doctorServices } from "./doctor.services";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import pick from "../../shared/pick";
import { filterableDoctorFields } from "./doctor.constants";

const getAllDoctor = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, filterableDoctorFields);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await doctorServices.getAllDoctorFromDb(query, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctors have been retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
	const doctorId = req.params.doctorId;
	const result = await doctorServices.getSingleDoctorFromDb(doctorId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified doctor has been retrieved successfully.",
		data: result,
	});
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await doctorServices.updateDoctorIntoDb(id, req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Doctor data updated successfully",
		data: result,
	});
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
	const doctorId = req.params.doctorId;
	const result = await doctorServices.deleteDoctorFromDb(doctorId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified doctor has been deleted successfully.",
		data: result,
	});
});

const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
	const doctorId = req.params.doctorId;
	const result = await doctorServices.softDeleteDoctorFromDb(doctorId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified doctor has been deleted successfully.",
		data: result,
	});
});

export const doctorController = {
	updateDoctor,
	getAllDoctor,
	getSingleDoctor,
	deleteDoctor,
	softDeleteDoctor,
};
