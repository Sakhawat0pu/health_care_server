import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.services";
import pick from "../../shared/pick";

const createDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await doctorScheduleServices.createDoctorScheduleIntoDb(
		user,
		req.body
	);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Doctor Schedule created successfully.",
		data: result,
	});
});

const getMySchedule = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const params = pick(req.query, ["startDateTime", "endDateTime", "isBooked"]);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await doctorScheduleServices.getMyScheduleFromDb(
		params,
		options,
		user
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My Schedule retrieved successfully.",
		data: result,
	});
});

const deleteMySchedule = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const scheduleId = req.params.scheduleId;
	const result = await doctorScheduleServices.deleteMyScheduleFromDb(
		user,
		scheduleId
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My specified Schedule deleted successfully.",
		data: result,
	});
});

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
	const params = pick(req.query, ["startDateTime", "endDateTime", "isBooked"]);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await doctorScheduleServices.getAllDoctorScheduleFromDb(
		params,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedules retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

export const doctorScheduleController = {
	createDoctorSchedule,
	getMySchedule,
	deleteMySchedule,
	getAllDoctorSchedule,
};
