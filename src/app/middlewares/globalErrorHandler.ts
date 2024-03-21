import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import handleDuplicateError from "../errors/handleDuplicateError";
import AppError from "../errors/AppError";
import handleZodError from "../errors/handleZodError";
import { ZodError } from "zod";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
	let statusCode = 500;
	let message = "Something went wrong!";

	if (err instanceof ZodError) {
		const simplifiedError = handleZodError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
	} else if (err.code === 11000) {
		const simplifiedError = handleDuplicateError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
	} else if (err.name === "TokenExpiredError") {
		statusCode = httpStatus.UNAUTHORIZED;
		message = "Unauthorized User";
	} else if (err instanceof AppError) {
		statusCode = err?.statusCode;
		message = err?.message;
	} else if (err instanceof Error) {
		message = err?.message;
	}

	return res.status(statusCode).json({
		success: false,
		message,
		error: err,
	});
};

export default globalErrorHandler;
