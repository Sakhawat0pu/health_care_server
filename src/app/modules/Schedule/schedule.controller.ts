import { Request, Response } from "express";
import httpStatus from "http-status";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { scheduleServices } from "./schedule.services";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
	const result = await scheduleServices.createScheduleIntoDb(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Schedule created successfully.",
		data: result,
	});
});

const getAllSchedule = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const params = pick(req.query, ["startDateTime", "endDateTime"]);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await scheduleServices.getAllScheduleFromDb(
		params,
		options,
		user
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedule retrieved successfully.",
		data: result,
	});
});

const getASchedule = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.scheduleId;
	const result = await scheduleServices.getAScheduleFromDb(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified Schedule retrieved successfully.",
		data: result,
	});
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.scheduleId;
	const result = await scheduleServices.deleteAScheduleFromDb(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Specified Schedule deleted successfully.",
		data: result,
	});
});

export const scheduleController = {
	createSchedule,
	getASchedule,
	getAllSchedule,
	deleteSchedule,
};
