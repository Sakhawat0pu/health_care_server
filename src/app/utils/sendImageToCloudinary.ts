import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import config from "../config";
import multer from "multer";
import fs from "fs";

cloudinary.config({
	cloud_name: config.cloudinary_cloud_name,
	api_key: config.cloudinary_api_key,
	api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = async (
	file: any
): Promise<Record<string, unknown>> => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file.path,
			{ public_id: file.originalname },
			function (error, result) {
				if (error) {
					reject(error);
				}
				resolve(result as UploadApiResponse);
				fs.unlink(file.path, (err) => {
					if (err) {
						reject(err);
					} else {
						console.log("The file has been deleted");
					}
				});
			}
		);
	});
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, process.cwd() + "/uploads");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix);
	},
});

export const upload = multer({ storage: storage });
