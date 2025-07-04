import videofile from "../Models/videofile.js";
import path from "path";
import { uploadsDir } from "../Helper/filehelper.js";
import fs from "fs";

// Helper function to check if file exists
const fileExists = (filepath) => {
    const fullPath = path.join(uploadsDir, path.basename(filepath));
    return fs.existsSync(fullPath);
};

// Helper function to get correct filepath
const getCorrectFilepath = (filename) => {
    if (!filename) return null;

    // Try to find the file in uploads directory
    const files = fs.readdirSync(uploadsDir);
    const matchingFile = files.find(file => file.includes(filename.replace(/[^a-zA-Z0-9.-]/g, '_')));

    if (matchingFile) {
        return `uploads/${matchingFile}`;
    }

    return null;
};

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

        // Get just the filename from the full path
        const filename = path.basename(req.file.path);
        // Store only the relative path in the database
        const storagePath = `uploads/${filename}`;

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
            uploader: file.uploader,
            videochanel: file.videochanel,
            physicalPath: req.file.path
        });

        await file.save();

        console.log("File saved successfully with ID:", file._id);

        res.status(200).json({
            message: "File uploaded successfully",
            file: {
                _id: file._id,
                title: file.videotitle,
                filename: file.filename,
                filepath: file.filepath,
                size: file.filesize,
                uploader: file.uploader,
                videochanel: file.videochanel
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

        // Fix file paths for videos that don't exist
        const fixedFiles = await Promise.all(files.map(async (file) => {
            const fileExists = fs.existsSync(path.join(uploadsDir, path.basename(file.filepath)));

            if (!fileExists) {
                console.log(`File not found: ${file.filepath}, trying to fix...`);
                const correctPath = getCorrectFilepath(file.filename);

                if (correctPath) {
                    console.log(`Updating filepath from ${file.filepath} to ${correctPath}`);
                    file.filepath = correctPath;
                    await file.save();
                } else {
                    console.log(`Could not find matching file for: ${file.filename}`);
                }
            }

            return file;
        }));

        res.status(200).send(fixedFiles);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({
            message: "Error fetching videos",
            error: error.message
        });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Attempting to delete video with ID: ${id}`);

        // Find the video first to get the filepath
        const video = await videofile.findById(id);

        if (!video) {
            return res.status(404).json({
                message: "Video not found"
            });
        }

        // Check if the user is authorized to delete this video
        // You might want to add user authentication here
        // For now, we'll allow deletion if the video exists

        // Delete the physical file
        const filePath = path.join(uploadsDir, path.basename(video.filepath));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted physical file: ${filePath}`);
        } else {
            console.log(`Physical file not found: ${filePath}`);
        }

        // Delete from database
        await videofile.findByIdAndDelete(id);

        console.log(`Video deleted successfully: ${id}`);

        res.status(200).json({
            message: "Video deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({
            message: "Error deleting video",
            error: error.message
        });
    }
};