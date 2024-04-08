import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialties.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../utils/sendImageToCloudinary";
import validateRequest from "../../middlewares/validateRequest";
import { specialtiesValidation } from "./specialties.validations";

const route = express.Router();

route.get(
	"/",
	// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	specialtiesController.getSpecialties
);

route.post(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		next();
	},
	validateRequest(specialtiesValidation.createSpecialtiesValidationSchema),
	specialtiesController.createSpecialties
);

route.delete(
	"/:id",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	specialtiesController.deleteSpecialties
);

export const specialtiesRoutes = route;
