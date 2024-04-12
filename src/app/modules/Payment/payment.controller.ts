import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { paymentServices } from "./payment.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const initPayment = catchAsync(async (req: Request, res: Response) => {
	const appointmentId = req.params.appointmentId;
	const result = await paymentServices.initPayment(appointmentId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment initiated successfully",
		data: result,
	});
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
	const result = await paymentServices.validatePayment(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment validated successfully",
		data: result,
	});
});

export const paymentController = {
	initPayment,
	validatePayment,
};
