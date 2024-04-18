import express from "express";
import { metaControllers } from "./meta.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
	"/",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
	metaControllers.getMetaData
);

export const metaRoutes = router;
