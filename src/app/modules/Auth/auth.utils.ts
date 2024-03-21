import jwt from "jsonwebtoken";

const createToken = (
	jwtPayload: { email: string; role: string },
	secretKey: string,
	expiresIn: string
) => {
	return jwt.sign(jwtPayload, secretKey, { expiresIn });
};

export default createToken;
