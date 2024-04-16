import config from "../../config";
import axios from "axios";
import prisma from "../../shared/prisma";
import { SSLServices } from "../SSL/ssl.services";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";

const initPayment = async (appointmentId: string) => {
	const paymentData = await prisma.payment.findFirstOrThrow({
		where: {
			appointmentId,
		},
		include: {
			appointment: {
				include: {
					patient: true,
				},
			},
		},
	});

	const paymentPatientData = {
		total_amount: paymentData.amount,
		tran_id: paymentData.transactionId,
		cus_name: paymentData.appointment.patient.name,
		cus_email: paymentData.appointment.patient.email,
		cus_add: paymentData.appointment.patient.address,
		cus_phone: paymentData.appointment.patient.contactNumber,
	};

	const result = await SSLServices.initSSLPayment(paymentPatientData);

	return {
		paymentURL: result.GatewayPageURL,
	};
};

const validatePayment = async (params: Record<string, unknown>) => {
	if (!params || !params.status || params.status !== "VALID") {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid Payment!");
	}

	// const paymentValidationData = await SSLServices.validatePayment(params);

	// if (!paymentValidationData || paymentValidationData.status !== "VALID") {
	// 	throw new AppError(httpStatus.BAD_REQUEST, "Payment Failed");
	// }

	const paymentValidationData = params; // uncomment the commented lines after the backend is deployed and delete line 50

	await prisma.$transaction(async (client) => {
		const updatedPaymentInfo = await client.payment.update({
			where: {
				transactionId: paymentValidationData.tran_id as string,
			},
			data: {
				paymentStatus: PaymentStatus.PAID,
				paymentGatewayData: paymentValidationData as object,
			},
		});

		await client.appointment.update({
			where: {
				id: updatedPaymentInfo.appointmentId,
			},
			data: {
				paymentStatus: PaymentStatus.PAID,
				status: AppointmentStatus.CANCELLED,
			},
		});
	});

	return {
		message: "Payment successful",
	};
};

export const paymentServices = {
	initPayment,
	validatePayment,
};
