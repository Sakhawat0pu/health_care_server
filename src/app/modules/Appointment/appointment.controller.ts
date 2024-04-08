import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appointmentServices } from "./appointment.services";

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

export const appointmentController = {
	createAppointment,
};
