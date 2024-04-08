import { UserRole, UserStatus } from "@prisma/client";
import config from "../config";
import prisma from "../shared/prisma";

const superUser = {
	email: "s19hossain98@gmail.com",
	password: config.super_admin_password!,
	needPasswordChange: false,
	role: UserRole.SUPER_ADMIN,
	status: UserStatus.ACTIVE,
};

const seedSuperAdmin = async () => {
	const isSuperAdminExits = await prisma.user.findUnique({
		where: {
			email: superUser.email,
		},
	});

	if (!isSuperAdminExits) {
		await prisma.user.create({
			data: superUser,
		});
	}
};

export default seedSuperAdmin;
