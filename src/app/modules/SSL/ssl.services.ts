import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TPaymentPatientData } from "./ssl.interface";
import config from "../../config";
import axios from "axios";

const initSSLPayment = async (paymentPatientData: TPaymentPatientData) => {
	try {
		const data = {
			store_id: config.ssl_store_id,
			store_passwd: config.ssl_store_password,
			total_amount: paymentPatientData.total_amount,
			currency: "BDT",
			tran_id: paymentPatientData.tran_id, // use unique tran_id for each api call
			success_url: config.ssl_success_url,
			fail_url: config.ssl_fail_url,
			cancel_url: config.ssl_cancel_url,
			ipn_url: "http://localhost:3030/ipn",
			shipping_method: "N/A",
			product_name: "Appointment",
			product_category: "Service",
			product_profile: "general",
			cus_name: paymentPatientData.cus_name,
			cus_email: paymentPatientData.cus_email,
			cus_add1: paymentPatientData.cus_add,
			cus_add2: "N/A",
			cus_city: "N/A",
			cus_state: "N/A",
			cus_postcode: 1000,
			cus_country: "Bangladesh",
			cus_phone: paymentPatientData.cus_phone,
			cus_fax: "N/A",
			ship_name: "N/A",
			ship_add1: "N/A",
			ship_add2: "N/A",
			ship_city: "N/A",
			ship_state: "N/A",
			ship_postcode: 1000,
			ship_country: "N/A",
		};
		const response = await axios({
			method: "POST",
			url: config.ssl_session_api,
			data: data,
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
		});

		return response.data;
	} catch (err) {
		throw new AppError(httpStatus.BAD_REQUEST, "Failed to process payment.");
	}
};

const validatePayment = async (params: Record<string, unknown>) => {
	try {
		const response = await axios({
			method: "GET",
			url: `${config.ssl_web_validation_api}?val_id=${params.val_id}&store_id=${config.ssl_store_id}&store_passwd=${config.ssl_store_password}&format=json`,
		});
		return response.data;
	} catch (err) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
	}
};

export const SSLServices = {
	initSSLPayment,
	validatePayment,
};
