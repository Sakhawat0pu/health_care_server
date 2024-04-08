import { Admin, Prisma, UserStatus } from "@prisma/client";
import { searchableAdminFields } from "./admin.constants";
import prisma from "../../shared/prisma";
import calculatePagination from "../../utils/calculatePagination";
import { TPaginationOptions } from "../../interface/pagination";

const getAllAdminFromDb = async (
	params: Record<string, any>,
	options: TPaginationOptions
) => {
	const { searchTerm, ...filterData } = params;
	const andConditions: Prisma.AdminWhereInput[] = [{ isDeleted: false }];

	if (searchTerm) {
		andConditions.push({
			OR: searchableAdminFields.map((field) => ({
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

	const whereCondition: Prisma.AdminWhereInput = { AND: andConditions };
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const result = await prisma.admin.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
	});

	const totalDocuments = await prisma.admin.count({
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

const getSingleAdminFromDb = async (id: string) => {
	const result = await prisma.admin.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});

	return result;
};

const updateAdminIntoDb = async (id: string, payload: Partial<Admin>) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});
	const result = await prisma.admin.update({
		where: {
			id,
		},
		data: payload,
	});
	return result;
};

const deleteAdminFromDb = async (id: string) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
		},
	});

	const result = await prisma.$transaction(async (client) => {
		const deletedAdmin = await client.admin.delete({
			where: {
				id,
			},
		});

		await client.user.delete({
			where: {
				email: deletedAdmin?.email,
			},
		});

		return deletedAdmin;
	});

	return result;
};

const softDeleteAdminFromDb = async (id: string) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
		},
	});
	const result = await prisma.$transaction(async (client) => {
		const deletedAdmin = await client.admin.update({
			where: {
				id,
			},
			data: {
				isDeleted: true,
			},
		});

		await client.user.update({
			where: {
				email: deletedAdmin?.email,
			},
			data: {
				status: UserStatus.DELETED,
			},
		});

		return deletedAdmin;
	});

	return result;
};

export const adminServices = {
	getAllAdminFromDb,
	getSingleAdminFromDb,
	updateAdminIntoDb,
	deleteAdminFromDb,
	softDeleteAdminFromDb,
};
