import { Request } from "express";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import prisma from "../../shared/prisma";

const createSpecialtiesIntoDb = async (req: Request) => {
	const imgFile = req.file;
	const payload = req.body;

	if (imgFile) {
		const imgData = await sendImageToCloudinary(imgFile);
		payload.icon = imgData.secure_url;
	}

	const result = await prisma.specialties.create({
		data: payload,
	});

	return result;
};

const getAllSpecialtiesFromDB = async () => {
	const result = await prisma.specialties.findMany();
	return result;
};

const deleteASpecialtiesFromDb = async (id: string) => {
	await prisma.specialties.findUniqueOrThrow({
		where: {
			id: id,
		},
	});

	const result = await prisma.specialties.delete({
		where: {
			id: id,
		},
	});

	return result;
};

export const specialtiesServices = {
	createSpecialtiesIntoDb,
	getAllSpecialtiesFromDB,
	deleteASpecialtiesFromDb,
};
