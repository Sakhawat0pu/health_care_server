import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { adminRoutes } from "../modules/Admin/admin.route";
import { authRoutes } from "../modules/Auth/auth.route";

const router = express.Router();

const allRoutes = [
	{
		path: "/user",
		route: userRoutes,
	},
	{
		path: "/admin",
		route: adminRoutes,
	},
	{
		path: "/auth",
		route: authRoutes,
	},
];

allRoutes.forEach((rt) => router.use(rt.path, rt.route));

export default router;
