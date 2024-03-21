import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";

const createAdminIntoDb = async (payload: Record<string, any>) => {
	const hashedPassword = await bcrypt.hash(payload.password, 12);
	const userData = {
		email: payload?.admin?.email,
		password: hashedPassword,
		role: UserRole.ADMIN,
	};

	const result = await prisma.$transaction(async (client) => {
		const createdUserData = await client.user.create({
			data: userData,
		});

		const createdAdminData = await client.admin.create({
			data: payload?.admin,
		});

		return createdAdminData;
	});
	return result;
};

export const userServices = {
	createAdminIntoDb,
};
