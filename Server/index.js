import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import videoroutes from './Routes/video.js'
import userroutes from "./Routes/User.js"
import path from 'path'
import commentroutes from './Routes/comment.js'
import multer from 'multer'
import { uploadsDir } from './Helper/filehelper.js'
import groupRoutes from './Routes/groups.js'
import messageRoutes from './Routes/messages.js'
import razorpayRoutes from './Routes/razorpay.js'

dotenv.config()
const app = express()

// Security headers middleware
app.use((req, res, next) => {
    // Allow same-origin and cross-origin access
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static video files with proper headers
app.use('/uploads', (req, res, next) => {
    // Get the origin from the request
    const origin = req.headers.origin;

    // Debug logging
    console.log('Video request:', {
        url: req.url,
        origin: origin,
        method: req.method,
        userAgent: req.headers['user-agent']
    });

    // Define allowed origins for video files
    const allowedVideoOrigins = [
        'https://yourtube-client.netlify.app',
        'https://yourtubesb.netlify.app',
        'https://your-tube-client.netlify.app',
        'http://localhost:3000'
    ];

    // Set CORS headers for video files
    if (origin && allowedVideoOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('CORS: Using specific origin:', origin);
    } else if (origin && origin.includes('netlify.app')) {
        // Allow any netlify.app domain for flexibility
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('CORS: Using netlify.app origin:', origin);
    } else {
        // Default fallback
        res.setHeader('Access-Control-Allow-Origin', 'https://yourtubesb.netlify.app');
        console.log('CORS: Using default origin for:', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('CORS: Handling preflight request');
        res.status(200).end();
        return;
    }

    next();
}, express.static(uploadsDir));

// CORS configuration for API routes
const allowedOrigins = [
    'http://localhost:3000',
    'https://yourtubesb.netlify.app',
    'https://your-tube-client.netlify.app',
    'https://yourtube-client.netlify.app' // Add your actual production domain
];

// CORS middleware for all routes except /uploads
app.use(/^(?!\/uploads).*/, cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Handle preflight requests for all routes
app.options('*', (req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || req.path.startsWith('/uploads')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.status(200).send();
    } else {
        res.status(403).send();
    }
});

// Body parser configuration
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "YourTube API is working",
        status: "success",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: "MongoDB",
            payment: process.env.RAZORPAY_KEY_ID ? "Razorpay (configured)" : "Razorpay (not configured)",
            email: process.env.EMAIL_USER ? "Email (configured)" : "Email (not configured)",
            sms: process.env.TWILIO_ACCOUNT_SID ? "SMS (configured)" : "SMS (not configured)"
        },
        frontend_url: process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app'
    });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
    const origin = req.headers.origin;
    console.log('CORS test request from:', origin);

    res.json({
        message: "CORS test successful",
        origin: origin,
        timestamp: new Date().toISOString()
    });
});

// Handle group join redirects from old invite links
app.get('/group/join/:groupId', (req, res) => {
    const { groupId } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app';
    const redirectUrl = `${frontendUrl}/group/join/${groupId}`;

    console.log('Redirecting group join request:', {
        groupId,
        from: req.originalUrl,
        to: redirectUrl
    });

    res.redirect(redirectUrl);
});

app.use('/user', userroutes);
app.use('/video', videoroutes);
app.use('/comment', commentroutes);
app.use('/groups', groupRoutes);
app.use('/messages', messageRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large. Maximum size is 50MB'
            });
        }
        return res.status(400).json({
            message: 'File upload error',
            error: err.message
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            error: err.message
        });
    }

    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        const DB_URI = process.env.DB_URI;
        await mongoose.connect(DB_URI);
        console.log("MongoDB Database connected");
        console.log(`Using uploads directory: ${uploadsDir}`);

        app.listen(PORT, () => {
            console.log(`Server running on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start();