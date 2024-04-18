import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
	log: [
		{ level: "query", emit: "event" },
		{ level: "warn", emit: "event" },
		{ level: "info", emit: "event" },
		{ level: "error", emit: "event" },
	],
});

prisma.$on("query", (e) => {
	console.log("Query: " + e.query);
	console.log("Params: " + e.params);
	console.log("Duration: " + e.duration + "ms");
});

// prisma.$on("warn", (e) => {
// 	console.log(e);
// });

// prisma.$on("info", (e) => {
// 	console.log(e);
// });

// prisma.$on("error", (e) => {
// 	console.log(e);
// });

export default prisma;
