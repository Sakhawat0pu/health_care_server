import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updateStatusValidationSchema = z.object({
	body: z.object({
		status: z.enum(
			[UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED],
			{ required_error: "Status is required" }
		),
	}),
});

const updateProfileValidationSchema = z.object({
	body: z.object({
		status: z.enum(
			[UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED],
			{ required_error: "Status is required" }
		),
	}),
});

export const userValidations = {
	updateStatusValidationSchema,
	updateProfileValidationSchema,
};
