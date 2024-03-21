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

export const authController = {
	loginUser,
};
