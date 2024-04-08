import { jwtHelpers } from "./auth.utils";
import bcrypt from "bcrypt";
import { UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";

const loginUser = async (payload: { email: string; password: string }) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload?.email,
		},
	});

	if (
		user.status === UserStatus.BLOCKED ||
		user.status === UserStatus.DELETED
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"User has been blocked or does not exist"
		);
	}

	if (!(await bcrypt.compare(payload?.password, user.password))) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Incorrect Password, please provide the right password."
		);
	}

	const jwtPayload = {
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtHelpers.createToken(
		jwtPayload,
		config.jwt_access_secret as string,
		config.jwt_access_token_expires_in as string
	);
	const refreshToken = jwtHelpers.createToken(
		jwtPayload,
		config.jwt_refresh_secret as string,
		config.jwt_refresh_token_expires_in as string
	);

	return {
		accessToken,
		refreshToken,
		needPasswordChange: user.needPasswordChange,
	};
};

const refreshToken = async (token: string) => {
	const decoded = jwtHelpers.verifyToken(
		token,
		config.jwt_refresh_secret as string
	);

	if (!decoded) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
	}

	const { email, role } = decoded;

	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (
		user.status === UserStatus.BLOCKED ||
		user.status === UserStatus.DELETED
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Specified user has been deleted or blocked"
		);
	}

	const jwtPayload = {
		email,
		role,
	};

	const accessToken = jwtHelpers.createToken(
		jwtPayload,
		config.jwt_access_secret as string,
		config.jwt_access_token_expires_in as string
	);

	return { accessToken };
};

const changePasswordFromDb = async (
	user: JwtPayload,
	payload: { oldPassword: string; newPassword: string }
) => {
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			email: user?.email,
			status: UserStatus.ACTIVE,
		},
	});

	const passwordMatched = await bcrypt.compare(
		payload?.oldPassword,
		userInfo.password
	);

	if (!passwordMatched) {
		throw new AppError(httpStatus.BAD_REQUEST, "Password did not matched");
	}

	const newHashedPassword = await bcrypt.hash(
		payload?.newPassword,
		Number(config.bcrypt_salt_round)
	);

	const updatedUser = await prisma.user.update({
		where: {
			email: userInfo?.email,
		},
		data: {
			password: newHashedPassword,
			needPasswordChange: false,
		},
		select: {
			id: true,
			email: true,
			role: true,
		},
	});

	return updatedUser;
};

const forgotPassword = async (payload: { email: string }) => {
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload?.email,
			status: UserStatus.ACTIVE,
		},
	});

	const jwtPayload = {
		email: userInfo.email,
		role: userInfo.role,
	};

	const resetToken = jwtHelpers.createToken(
		jwtPayload,
		config.reset_password_secret_token as string,
		config.reset_password_token_expires_in as string
	);

	const reset_pass_link = `${config.frontend_base_uri}/reset-password?userId=${userInfo.id}&token=${resetToken}`;
	const resetHtml = `
		<div>
			<p>
				Dear User,<br>
				We received a request to reset the password for your account. If you initiated this request, please follow the instructions below to reset your password.<br>
		Please click the link below:
			</p>
			<p>
				<a href=${reset_pass_link}>Password reset link</a>
			</p>
		</div>
	`;
	await sendEmail(userInfo.email, resetHtml);
	return null;
};

const resetPassword = async (
	token: string | undefined,
	payload: { userId: string; password: string }
) => {
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			id: payload?.userId,
			status: UserStatus.ACTIVE,
		},
	});

	if (!token) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
	}

	const decoded = jwtHelpers.verifyToken(
		token,
		config.reset_password_secret_token as string
	) as JwtPayload;

	if (!decoded) {
		throw new AppError(httpStatus.FORBIDDEN, "Reset token is not valid");
	}

	const { email } = decoded;

	const user = await prisma.user.findUnique({
		where: {
			email: email,
			status: UserStatus.ACTIVE,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.FORBIDDEN, "Reset token is not valid");
	}

	if (userInfo.id !== user.id) {
		throw new AppError(httpStatus.FORBIDDEN, "Reset token is not valid");
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_round)
	);

	const updatedDate = await prisma.user.update({
		where: {
			id: payload?.userId,
		},
		data: {
			password: hashedPassword,
		},
		select: {
			email: true,
		},
	});

	return updatedDate;
};

export const authServices = {
	loginUser,
	refreshToken,
	changePasswordFromDb,
	forgotPassword,
	resetPassword,
};
