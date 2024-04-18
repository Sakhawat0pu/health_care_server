import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import handleDuplicateError from "../errors/handleDuplicateError";
import AppError from "../errors/AppError";
import handleZodError from "../errors/handleZodError";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
	let statusCode = 500;
	let message = "Something went wrong!";
	let error = err;

	if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = 403;
		message = "Validation error";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = 409;
			message = "Unique constraint failed";
			error = err.meta;
		}
	} else if (err instanceof ZodError) {
		const simplifiedError = handleZodError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		error = simplifiedError.errorSources;
	} else if (err.code === 11000) {
		const simplifiedError = handleDuplicateError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		error = simplifiedError.errorSources;
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
		error,
	});
};

export default globalErrorHandler;
