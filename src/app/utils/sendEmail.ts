import nodemailer from "nodemailer";
import config from "../config";

export const sendEmail = async (to: string, html: string) => {
	const passResetText = `
	Dear User,
	We received a request to reset the password for your account. If you initiated this request, please follow the instructions below to reset your password.
	Please click the link below:
`;
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com", // gmail host name
		port: 587,
		secure: config.node_env === "production",
		auth: {
			// TODO: replace `user` and `pass` values from <https://forwardemail.net>
			user: config.email_address,
			pass: config.app_pass,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	await transporter.sendMail({
		from: `"Health Care" <${config.email_address}>`, // sender address
		to, // list of receivers
		subject: "Please reset your password in 10 minutes", // Subject line
		text: passResetText, // plain text body
		html, // html body
	});
};
