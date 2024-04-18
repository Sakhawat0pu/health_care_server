import bcrypt from "bcrypt";
import { UserRole, UserStatus } from "@prisma/client";
import config from "../src/app/config";
import prisma from "../src/app/shared/prisma";

const superUser = {
	email: "s19hossain98@gmail.com",
	password: config.super_admin_password as string,
	needPasswordChange: false,
	role: UserRole.SUPER_ADMIN,
	status: UserStatus.ACTIVE,
};

const superUserAdminData = {
	name: "Sakhawat Hossain", // don't need email since email is used as foreign key field in admin model
	contactNumber: "123456789",
};

const seedSuperAdmin = async () => {
	superUser.password = await bcrypt.hash(
		config.super_admin_password as string,
		Number(config.bcrypt_salt_round)
	);
	try {
		const isSuperAdminExits = await prisma.user.findFirst({
			where: {
				email: superUser.email,
				role: UserRole.SUPER_ADMIN,
			},
		});

		if (isSuperAdminExits) {
			console.log(`Super Admin with ${superUser.email} already exists!!!`);
		}

		if (!isSuperAdminExits) {
			const superAdmin = await prisma.user.create({
				data: { ...superUser, admin: { create: superUserAdminData } },
				select: {
					id: true,
					email: true,
					role: true,
					status: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			console.log("Super Admin created successfully.");
			console.log(superAdmin);
		}
	} catch (err) {
		console.error(err);
	} finally {
		await prisma.$disconnect();
	}
};

seedSuperAdmin();
