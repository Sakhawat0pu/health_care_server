import { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../shared/prisma";

const createAppointmentIntoDb = async (
	patientInfo: JwtPayload,
	payload: Record<string, any>
) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: patientInfo.email,
			isDeleted: false,
		},
	});

	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			id: payload.doctorId,
		},
	});

	const doctorScheduleData = await prisma.doctorSchedule.findUniqueOrThrow({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: payload.scheduleId,
			},
			isBooked: false,
		},
	});

	const videoCallingId = uuidv4();

	const result = await prisma.$transaction(async (client) => {
		const appointmentData = await client.appointment.create({
			data: {
				patientId: patientData.id,
				doctorId: doctorData.id,
				scheduleId: doctorScheduleData.scheduleId,
				videoCallingId: videoCallingId,
			},
			include: {
				patient: true,
				doctor: true,
				schedule: true,
			},
		});

		await client.doctorSchedule.update({
			where: {
				doctorId_scheduleId: {
					doctorId: doctorData.id,
					scheduleId: payload.scheduleId,
				},
				isBooked: false,
			},
			data: {
				isBooked: true,
				appointmentId: appointmentData.id,
			},
		});

		const today = new Date();
		const transactionId =
			"online-healthcare-" +
			today.getFullYear() +
			"-" +
			today.getMonth() +
			"-" +
			today.getDate() +
			"-" +
			today.getHours() +
			"-" +
			today.getMinutes() +
			"-" +
			today.getSeconds();

		await client.payment.create({
			data: {
				appointmentId: appointmentData.id,
				amount: doctorData.appointmentFee,
				transactionId: transactionId,
			},
		});

		return appointmentData;
	});

	return result;
};

export const appointmentServices = {
	createAppointmentIntoDb,
};
