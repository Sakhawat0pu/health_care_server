import { z } from "zod";

const createPatientValidationSchema = z.object({
	body: z.object({
		password: z.string({ required_error: "Password is required" }),
		patient: z.object({
			name: z.string({ required_error: "Name is required" }),
			email: z.string({ required_error: "Email is required" }),
			contactNumber: z.string({ required_error: "ContactNumber is required" }),
			profilePhoto: z.string().optional(),
			address: z.string({ required_error: "Address is required." }),
		}),
	}),
});

const updatePatientValidationSchema = z.object({
	body: z.object({
		name: z.string().optional(),
		password: z.string().optional(),
		contactNumber: z.string().optional(),
		profilePhoto: z.string().optional(),
		address: z.string().optional(),
	}),
});

export const patientValidations = {
	createPatientValidationSchema,
	updatePatientValidationSchema,
};
