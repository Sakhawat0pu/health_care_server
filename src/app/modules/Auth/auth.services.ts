import bcrypt from "bcrypt";
import { UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import config from "../../config";
import createToken from "./auth.utils";

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

	const accessToken = createToken(
		jwtPayload,
		config.jwt_access_secret as string,
		config.jwt_access_token_expires_in as string
	);
	const refreshToken = createToken(
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

export const authServices = {
	loginUser,
};
