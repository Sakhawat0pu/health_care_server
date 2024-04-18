import bcrypt from "bcrypt";
import { UserRole, UserStatus } from "@prisma/client";
import config from "../config";
import prisma from "../shared/prisma";

const superUser = {
	email: "s19hossain98@gmail.com",
	password: config.super_admin_password as string,
	needPasswordChange: false,
	role: UserRole.SUPER_ADMIN,
	status: UserStatus.ACTIVE,
};

const superUserAdminData = {
	name: "Sakhawat Hossain",
	email: superUser.email,
	contactNumber: "123456789",
};

const seedSuperAdmin = async () => {
	superUser.password = await bcrypt.hash(
		config.super_admin_password as string,
		Number(config.bcrypt_salt_round)
	);

	const isSuperAdminExits = await prisma.user.findFirst({
		where: {
			email: superUser.email,
			role: UserRole.SUPER_ADMIN,
		},
	});

	if (!isSuperAdminExits) {
		await prisma.user.create({
			data: { ...superUser, admin: { create: superUserAdminData } },
		});
	}
};

export default seedSuperAdmin;
