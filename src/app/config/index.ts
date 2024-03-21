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
};
