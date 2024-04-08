import { Gender } from "@prisma/client";
import { z } from "zod";

const createDoctorValidationSchema = z.object({
	body: z.object({
		password: z.string({ required_error: "Password is required" }),
		doctor: z.object({
			name: z.string({ required_error: "Name is required" }),
			email: z.string({ required_error: "Email is required" }),
			contactNumber: z.string({ required_error: "ContactNumber is required" }),
			profilePhoto: z.string().optional(),
			registrationNumber: z.string({
				required_error: "Registration number is required",
			}),
			experience: z.number().optional(),
			gender: z.enum([Gender.MALE, Gender.FEMALE], {
				required_error: "Gender is required",
			}),
			appointmentFee: z.number({
				required_error: "Appointment fee is required",
			}),
			qualification: z.string({ required_error: "Qualification is required" }),
			currentWorkingPlace: z.string({
				required_error: "Current working place is required",
			}),
			designation: z.string({ required_error: "Designation is required" }),
		}),
	}),
});

export const doctorValidation = {
	createDoctorValidationSchema,
};
