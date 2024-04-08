import { Prisma, PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";
import config from "../../config";
import { Request } from "express";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { TPaginationOptions } from "../../interface/pagination";
import calculatePagination from "../../utils/calculatePagination";
import { searchableUserFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";

const createAdminIntoDb = async (req: Request) => {
	const imgFile = req.file;
	const payload = req.body;

	if (imgFile) {
		const imgData: any = await sendImageToCloudinary(imgFile);
		payload.admin.profilePhoto = imgData.secure_url;
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_round)
	);
	const userData = {
		email: payload?.admin?.email,
		password: hashedPassword,
		role: UserRole.ADMIN,
	};

	const result = await prisma.$transaction(async (client) => {
		const createdUserData = await client.user.create({
			data: userData,
		});

		const createdAdminData = await client.admin.create({
			data: payload?.admin,
		});

		return createdAdminData;
	});
	return result;
};

const createDoctorIntoDb = async (req: Request) => {
	const payload = req.body;
	const imgFile = req.file;

	if (imgFile) {
		const imgData = await sendImageToCloudinary(imgFile);
		payload.doctor.profilePhoto = imgData.secure_url;
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_round)
	);
	const userData = {
		email: payload?.doctor?.email,
		password: hashedPassword,
		role: UserRole.DOCTOR,
	};

	const result = await prisma.$transaction(async (client) => {
		const createdUserData = await client.user.create({
			data: userData,
		});

		const createdDoctorData = await client.doctor.create({
			data: payload.doctor,
		});

		return createdDoctorData;
	});

	return result;
};

const createPatientIntoDb = async (req: Request) => {
	const imgFile = req.file;
	const payload = req.body;

	if (imgFile) {
		const imgData: any = await sendImageToCloudinary(imgFile);
		payload.patient.profilePhoto = imgData.secure_url;
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_round)
	);
	const userData = {
		email: payload?.patient?.email,
		password: hashedPassword,
		role: UserRole.PATIENT,
	};

	const result = await prisma.$transaction(async (client) => {
		const createdUserData = await client.user.create({
			data: userData,
		});

		const createdPatientData = await client.patient.create({
			data: payload?.patient,
		});

		return createdPatientData;
	});
	return result;
};

const getAllUserFromDb = async (
	params: Record<string, any>,
	options: TPaginationOptions
) => {
	const { searchTerm, ...filterData } = params;
	const andConditions: Prisma.UserWhereInput[] = [];

	if (searchTerm) {
		andConditions.push({
			OR: searchableUserFields.map((field) => ({
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

	const whereCondition: Prisma.UserWhereInput = { AND: andConditions };
	const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
	const result = await prisma.user.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		select: {
			id: true,
			email: true,
			role: true,
			status: true,
			needPasswordChange: true,
			createdAt: true,
			updatedAt: true,
			admin: true,
			doctor: true,
			patient: true,
		},
	});

	const totalDocuments = await prisma.user.count({
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

const updateUserStatusIntoDb = async (
	id: string,
	payload: Record<string, unknown>
) => {
	const isUserExists = await prisma.user.findUniqueOrThrow({
		where: {
			id,
		},
	});
	const result = await prisma.user.update({
		where: {
			id: id,
		},
		data: payload,
	});

	return result;
};

const getMyProfileFromDb = async (userInfo: JwtPayload) => {
	const result = await prisma.user.findUniqueOrThrow({
		where: {
			email: userInfo?.email,
			role: userInfo?.role,
			status: UserStatus.ACTIVE,
		},
		select: {
			id: true,
			role: true,
			email: true,
			needPasswordChange: true,
			status: true,
		},
	});

	let profileInfo;

	if (userInfo.role === UserRole.SUPER_ADMIN || userInfo.role.Admin) {
		profileInfo = await prisma.admin.findUnique({
			where: {
				email: result.email,
			},
		});
	}

	if (userInfo.role === UserRole.DOCTOR) {
		profileInfo = await prisma.doctor.findUnique({
			where: {
				email: result.email,
			},
		});
	}

	if (userInfo.role === UserRole.PATIENT) {
		profileInfo = await prisma.patient.findUnique({
			where: {
				email: result.email,
			},
		});
	}

	return { ...result, ...profileInfo };
};

const updateMyProfile = async (req: Request) => {
	const userInfo = req.user;
	const imgFile = req.file;
	const payload = req.body;
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: userInfo?.email,
			role: userInfo?.role,
			status: UserStatus.ACTIVE,
		},
	});

	if (imgFile) {
		const imgData = await sendImageToCloudinary(imgFile);
		payload.profilePhoto = imgData.secure_url;
	}

	let profileInfo;

	if (userInfo.role === UserRole.SUPER_ADMIN || userInfo.role.Admin) {
		profileInfo = await prisma.admin.update({
			where: {
				email: userData.email,
			},
			data: payload,
		});
	}

	if (userInfo.role === UserRole.DOCTOR) {
		profileInfo = await prisma.doctor.update({
			where: {
				email: userData.email,
			},
			data: payload,
		});
	}

	if (userInfo.role === UserRole.PATIENT) {
		profileInfo = await prisma.patient.update({
			where: {
				email: userData.email,
			},
			data: payload,
		});
	}

	return profileInfo;
};

export const userServices = {
	createAdminIntoDb,
	createDoctorIntoDb,
	createPatientIntoDb,
	getAllUserFromDb,
	updateUserStatusIntoDb,
	getMyProfileFromDb,
	updateMyProfile,
};
