"use strict";
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
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

export default upload;