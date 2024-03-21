import { Server } from "http";
import app from "./app";
import config from "./app/config";
const port = 8000;

let server: Server;
async function main() {
	try {
		server = app.listen(config.port, () => {
			console.log(`Listening on port ${config.port}`);
		});
	} catch (err) {
		console.log(err);
	}
}

main();

process.on("unhandledRejection", () => {
	console.log("Unhandled Rejection detected. The server is closing...");
	if (server) {
		server.close(() => {
			process.exit(1);
		});
	}
	process.exit(1);
});

process.on("uncaughtException", () => {
	console.log("Uncaught Exception detected. The server is closing...");
	process.exit(1);
});
