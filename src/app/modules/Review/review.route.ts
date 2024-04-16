import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { reviewController } from "./review.controller";

const router = express.Router();

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	reviewController.getAllReviews
);
router.post("/", auth(UserRole.PATIENT), reviewController.createPrescription);

export const reviewRoutes = router;
