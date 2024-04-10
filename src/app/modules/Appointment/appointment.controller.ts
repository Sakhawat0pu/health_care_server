import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appointmentServices } from "./appointment.services";
import pick from "../../shared/pick";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
	const result = await appointmentServices.createAppointmentIntoDb(
		req.user,
		req.body
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Appointment created successfully.",
		data: result,
	});
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, ["status", "paymentStatus"]);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await appointmentServices.getMyAppointmentsFromDb(
		req.user,
		query,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My appointment retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
	const query = pick(req.query, ["status", "paymentStatus"]);
	const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
	const result = await appointmentServices.getAllAppointmentsFromDb(
		query,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All appointments retrieved successfully.",
		meta: result.meta,
		data: result.data,
	});
});

export const appointmentController = {
	createAppointment,
	getMyAppointments,
	getAllAppointments,
};
