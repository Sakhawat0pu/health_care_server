import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import config from "../config";

import prisma from "../shared/prisma";
import { jwtHelpers } from "../modules/Auth/auth.utils";

const auth = (...requiredRoles: string[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.headers.authorization;

		if (!token) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		const decoded = jwtHelpers.verifyToken(
			token,
			config.jwt_access_secret as Secret
		) as JwtPayload;

		const { email, role } = decoded;

		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (!user) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Specified user does not exist in the database"
			);
		}

		if (user?.status === "DELETED") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Specified user has been deleted from the database"
			);
		}

		if (user?.status === "BLOCKED") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Specified user has been blocked"
			);
		}

		if (requiredRoles && !requiredRoles.includes(role)) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		req.user = decoded;
		next();
	});
};

export default auth;
