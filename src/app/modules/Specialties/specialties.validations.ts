import { z } from "zod";

const createSpecialtiesValidationSchema = z.object({
	body: z.object({
		title: z.string({ required_error: "Title is required" }),
	}),
});

export const specialtiesValidation = {
	createSpecialtiesValidationSchema,
};
