import { Server } from "http";
import app from "./app";
import config from "./app/config";
import seedSuperAdmin from "./app/db";

let server: Server;

async function main() {
	try {
		server = app.listen(config.port, () => {
			console.log(`Listening on port ${config.port}`);
		});
		await seedSuperAdmin();
	} catch (err) {
		console.log(err);
	}
}

main();

const exitHandler = () => {
	if (server) {
		server.close(() => {
			process.exit(1);
		});
	}
	process.exit(1);
};

process.on("unhandledRejection", () => {
	console.log("Unhandled Rejection detected. The server is closing...");
	exitHandler();
});

process.on("uncaughtException", () => {
	console.log("Uncaught Exception detected. The server is closing...");
	exitHandler();
});
