"use strict";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable for uploads directory or default to a persistent path
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.env.HOME || '/tmp', 'yourtube-uploads');

// Ensure uploads directory exists with absolute path
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to remove special characters
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + sanitizedName);
    },
});

const filefilter = (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
        cb(null, true);
    } else {
        cb(new Error("Only MP4 video files are allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: filefilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

// Export both the upload middleware and the uploads directory path
export { upload as default, uploadsDir };