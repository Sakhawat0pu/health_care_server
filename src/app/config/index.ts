import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	node_env: process.env.NODE_ENV,
	port: process.env.PORT,
	bcrypt_salt_round: process.env.BCRYPT_SALT_ROUNDS,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
	jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
	jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
	super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
	reset_password_secret_token: process.env.RESET_PASSWORD_SECRET_TOKEN,
	reset_password_token_expires_in: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
	frontend_base_uri: process.env.FRONTEND_BASE_URI,
	email_address: process.env.EMAIL_ADDRESS,
	app_pass: process.env.APP_PASS,
	cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
