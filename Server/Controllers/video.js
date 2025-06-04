import videofile from "../Models/videofile.js";

export const uploadvideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: req.fileValidationError || "Please upload a valid MP4 video file"
            });
        }

        const file = new videofile({
            videotitle: req.body.title,
            filename: req.file.originalname,
            filepath: req.file.path,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            videochanel: req.body.chanel,
            uploader: req.body.uploader,
        });

        await file.save();
        res.status(200).json({
            message: "File uploaded successfully",
            file: {
                title: file.videotitle,
                filename: file.filename,
                size: file.filesize,
                uploader: file.uploader
            }
        });
    } catch (error) {
        console.error("Upload error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Missing required fields",
                details: error.message
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
        res.status(500).json({
            message: "Error fetching videos",
            error: error.message
        });
    }
};