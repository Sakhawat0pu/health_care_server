import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const createToken = (
	jwtPayload: { email: string; role: string },
	secretKey: string,
	expiresIn: string
) => {
	return jwt.sign(jwtPayload, secretKey, { expiresIn });
};

const verifyToken = (token: string, secretKey: Secret) => {
	return jwt.verify(token, secretKey) as JwtPayload;
};

export const jwtHelpers = {
	createToken,
	verifyToken,
};
