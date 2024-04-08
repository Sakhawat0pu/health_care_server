import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { specialtiesServices } from "./specialties.services";

const createSpecialties = catchAsync(async (req: Request, res: Response) => {
	const result = await specialtiesServices.createSpecialtiesIntoDb(req);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Specialties created successfully",
		data: result,
	});
});

const getSpecialties = catchAsync(async (req: Request, res: Response) => {
	const result = await specialtiesServices.getAllSpecialtiesFromDB();
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Specialties data retrieved successfully",
		data: result,
	});
});

const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await specialtiesServices.deleteASpecialtiesFromDb(id);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Specialties data deleted successfully",
		data: result,
	});
});

export const specialtiesController = {
	createSpecialties,
	getSpecialties,
	deleteSpecialties,
};
