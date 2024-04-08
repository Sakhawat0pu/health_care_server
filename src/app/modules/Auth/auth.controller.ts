import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authServices } from "./auth.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import config from "../../config";

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const result = await authServices.loginUser(req.body);
	const { accessToken, refreshToken, needPasswordChange } = result;
	res.cookie("refreshToken", refreshToken, {
		secure: config.node_env === "production",
		httpOnly: true,
		sameSite: "none",
		maxAge: 365 * 24 * 60 * 60 * 1000,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Logged in successful",
		data: {
			accessToken,
			needPasswordChange,
		},
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const token = req.cookies.refreshToken;
	const result = await authServices.refreshToken(token);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access token created successfully",
		data: result,
	});
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await authServices.changePasswordFromDb(user, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password has been changed successfully",
		data: result,
	});
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	const result = await authServices.forgotPassword(req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password reset email send successfully",
		data: result,
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const token = req.headers.authorization;
	const result = await authServices.resetPassword(token, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password has been reset successfully",
		data: result,
	});
});

export const authController = {
	loginUser,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
};
