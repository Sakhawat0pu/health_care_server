import { Prisma, UserStatus } from "@prisma/client";
import { TPaginationOptions } from "../../interface/pagination";
import prisma from "../../shared/prisma";
import { searchableDoctorFields } from "./doctor.constants";
import calculatePagination from "../../utils/calculatePagination";

const getAllDoctorFromDb = async (
	params: Record<string, any>,
	options: TPaginationOptions
) => {
	const { searchTerm, specialties, ...filterData } = params;
	const andConditions: Prisma.DoctorWhereInput[] = [{ isDeleted: false }];

	if (searchTerm) {
		andConditions.push({
			OR: searchableDoctorFields.map((field) => ({
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

	if (specialties) {
		andConditions.push({
			doctorSpecialties: {
				some: {
					specialties: {
						title: {
							contains: specialties,
							mode: "insensitive",
						},
					},
				},
			},
		});
	}

	const whereCondition: Prisma.DoctorWhereInput = { AND: andConditions };
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const result = await prisma.doctor.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			doctorSpecialties: {
				include: {
					specialties: true,
				},
			},
		},
	});

	const totalDocuments = await prisma.doctor.count({
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

const getSingleDoctorFromDb = async (id: string) => {
	const result = await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			doctorSpecialties: {
				include: {
					specialties: true,
				},
			},
		},
	});

	return result;
};

const deleteDoctorFromDb = async (id: string) => {
	await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
		},
	});

	const result = await prisma.$transaction(async (client) => {
		const deletedDoctor = await client.doctor.delete({
			where: {
				id,
			},
		});

		await client.user.delete({
			where: {
				email: deletedDoctor?.email,
			},
		});

		return deletedDoctor;
	});

	return result;
};

const updateDoctorIntoDb = async (id: string, payload: Record<string, any>) => {
	const { specialties, ...doctorData } = payload;

	const doctorInfo = await prisma.doctor.findUniqueOrThrow({
		where: {
			id: id,
		},
	});

	await prisma.$transaction(async (client) => {
		await client.doctor.update({
			where: {
				id: id,
			},
			data: doctorData,
			include: {
				doctorSpecialties: true,
			},
		});

		if (specialties && specialties.length) {
			for (const specialty of specialties) {
				if (specialty.isDelete === true) {
					await client.doctorSpecialties.deleteMany({
						where: {
							doctorId: id,
							specialtiesId: specialty.id,
						},
					});
				}
				if (specialty.isDelete === false) {
					await client.doctorSpecialties.create({
						data: {
							doctorId: id,
							specialtiesId: specialty.id,
						},
					});
				}
			}
		}
	});

	const result = await prisma.doctor.findUnique({
		where: {
			id: id,
		},
		include: {
			doctorSpecialties: {
				include: {
					specialties: true,
				},
			},
		},
	});
	return result;
};

const softDeleteDoctorFromDb = async (id: string) => {
	await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});
	const result = await prisma.$transaction(async (client) => {
		const deletedDoctor = await client.doctor.update({
			where: {
				id,
			},
			data: {
				isDeleted: true,
			},
		});

		await client.user.update({
			where: {
				email: deletedDoctor?.email,
			},
			data: {
				status: UserStatus.DELETED,
			},
		});

		return deletedDoctor;
	});

	return result;
};

export const doctorServices = {
	getAllDoctorFromDb,
	getSingleDoctorFromDb,
	deleteDoctorFromDb,
	softDeleteDoctorFromDb,
	updateDoctorIntoDb,
};
