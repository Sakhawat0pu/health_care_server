import { z } from "zod";

const createAdminValidationSchema = z.object({
	body: z.object({
		password: z.string({ required_error: "Password is required" }),
		admin: z.object({
			name: z.string({ required_error: "Name is required" }),
			email: z.string({ required_error: "Email is required" }),
			contactNumber: z.string({ required_error: "ContactNumber is required" }),
			profilePhoto: z.string().optional(),
		}),
	}),
});

const updateAdminValidationSchema = z.object({
	body: z.object({
		name: z.string().optional(),
		contactNumber: z.string().optional(),
		profilePhoto: z.string().optional(),
	}),
});

export const adminValidation = {
	createAdminValidationSchema,
	updateAdminValidationSchema,
};
