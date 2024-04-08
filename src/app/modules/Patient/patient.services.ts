import { Admin, Patient, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import calculatePagination from "../../utils/calculatePagination";
import { TPaginationOptions } from "../../interface/pagination";
import { searchablePatientFields } from "./patient.constants";

const getAllPatientsFromDb = async (
	params: Record<string, any>,
	options: TPaginationOptions
) => {
	const { searchTerm, ...filterData } = params;
	const andConditions: Prisma.PatientWhereInput[] = [{ isDeleted: false }];

	if (searchTerm) {
		andConditions.push({
			OR: searchablePatientFields.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: "insensitive",
				},
			})),
		});
	}

	if (Object.keys(filterData).length) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: filterData[key],
				},
			})),
		});
	}

	const whereCondition: Prisma.PatientWhereInput = { AND: andConditions };
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const result = await prisma.patient.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			medicalReport: true,
			patientHealthData: true,
		},
	});

	const totalDocuments = await prisma.patient.count({
		//* total number of document may vary according to queries
		where: whereCondition,
	});
	const totalPages = Math.ceil(totalDocuments / limit);

	const meta = { page, limit, totalPages, totalDocuments };
	return {
		meta,
		data: result,
	};
};

const getSinglePatientFromDb = async (id: string) => {
	const result = await prisma.patient.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			medicalReport: true,
			patientHealthData: true,
		},
	});

	return result;
};

const updatePatientIntoDb = async (
	id: string,
	payload: Record<string, any>
) => {
	const { patientHealthData, medicalReport, ...patientData } = payload;
	await prisma.patient.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});

	const result = await prisma.$transaction(async (client) => {
		const updatedPatient = await client.patient.update({
			where: {
				id,
			},
			data: patientData,
			include: {
				medicalReport: true,
				patientHealthData: true,
			},
		});

		if (patientHealthData) {
			await client.patientHealthData.upsert({
				where: {
					patientId: id,
				},
				update: patientHealthData,
				create: { patientId: updatedPatient.id, ...patientHealthData },
			});
		}

		if (medicalReport) {
			await client.medicalReport.create({
				data: { patientId: updatedPatient.id, ...medicalReport },
			});
		}

		return await client.patient.findFirst({
			where: { id },
			include: { patientHealthData: true, medicalReport: true },
		});
	});

	return result;
};

const deletePatientFromDb = async (id: string) => {
	await prisma.patient.findUniqueOrThrow({
		where: {
			id,
		},
	});

	const result = await prisma.$transaction(async (client) => {
		await client.patientHealthData.delete({
			where: {
				patientId: id,
			},
		});

		await client.medicalReport.deleteMany({
			where: {
				patientId: id,
			},
		});

		const deletedPatient = await client.patient.delete({
			where: {
				id,
			},
		});

		await client.user.delete({
			where: {
				email: deletedPatient?.email,
			},
		});

		return deletedPatient;
	});

	return result;
};

const softDeletePatientFromDb = async (id: string) => {
	await prisma.patient.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});
	const result = await prisma.$transaction(async (client) => {
		const deletedPatient = await client.patient.update({
			where: {
				id,
			},
			data: {
				isDeleted: true,
			},
		});

		await client.user.update({
			where: {
				email: deletedPatient?.email,
			},
			data: {
				status: UserStatus.DELETED,
			},
		});

		return deletedPatient;
	});

	return result;
};

export const patientServices = {
	getAllPatientsFromDb,
	getSinglePatientFromDb,
	updatePatientIntoDb,
	deletePatientFromDb,
	softDeletePatientFromDb,
};
