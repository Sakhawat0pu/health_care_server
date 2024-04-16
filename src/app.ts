import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import { appointmentServices } from "./app/modules/Appointment/appointment.services";
import cron from "node-cron";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

cron.schedule("* * * * *", () => {
	try {
		appointmentServices.cancelUnpaidAppointments();
	} catch (err) {
		console.error(err);
	}
});

app.get("/", (req: Request, res: Response) => {
	res.json({ message: "A health care server" });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
