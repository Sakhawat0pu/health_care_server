import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";
import httpStatus from "http-status";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
	const errorSources: TErrorSources[] = err.issues.map((issue: ZodIssue) => {
		return {
			path: issue?.path[issue.path.length - 1],
			message: issue.message,
		};
	});

	return {
		statusCode: httpStatus.BAD_REQUEST,
		message: "Validation Error!",
		errorSources,
	};
};

export default handleZodError;
