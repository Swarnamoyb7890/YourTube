import videofile from "../Models/videofile.js";
import path from "path";

export const uploadvideo = async (req, res) => {
    try {
        console.log("Upload request received:", {
            headers: req.headers,
            body: req.body,
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            } : 'No file'
        });

        if (!req.file) {
            console.error("No file in request");
            return res.status(400).json({
                message: req.fileValidationError || "Please upload a valid MP4 video file"
            });
        }

        if (!req.body.title || !req.body.chanel || !req.body.uploader) {
            console.error("Missing required fields:", {
                title: !!req.body.title,
                chanel: !!req.body.chanel,
                uploader: !!req.body.uploader
            });
            return res.status(400).json({
                message: "Missing required fields",
                details: "Title, channel, and uploader are required"
            });
        }

        // Normalize the file path for storage
        const normalizedPath = path.normalize(req.file.path).replace(/\\/g, '/');
        const storagePath = `uploads/${path.basename(normalizedPath)}`;

        const file = new videofile({
            videotitle: req.body.title,
            filename: req.file.originalname,
            filepath: storagePath,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            videochanel: req.body.chanel,
            uploader: req.body.uploader,
        });

        console.log("Attempting to save file:", {
            title: file.videotitle,
            filename: file.filename,
            filepath: file.filepath,
            size: file.filesize,
            uploader: file.uploader
        });

        await file.save();

        console.log("File saved successfully");

        res.status(200).json({
            message: "File uploaded successfully",
            file: {
                title: file.videotitle,
                filename: file.filename,
                filepath: file.filepath,
                size: file.filesize,
                uploader: file.uploader
            }
        });
    } catch (error) {
        console.error("Upload error:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Missing required fields",
                details: error.message
            });
        }

        // Check for specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Duplicate file",
                details: "A file with this name already exists"
            });
        }

        res.status(500).json({
            message: "Error uploading video",
            error: error.message
        });
    }
};

export const getallvideos = async (req, res) => {
    try {
        const files = await videofile.find();
        res.status(200).send(files);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({
            message: "Error fetching videos",
            error: error.message
        });
    }
};