import jwt from "jsonwebtoken"

const auth = (req, res, next) => {
    try {
        // Log the incoming request headers
        console.log('Auth middleware - headers:', {
            authorization: req.headers.authorization,
            'content-type': req.headers['content-type']
        });

        if (!req.headers.authorization) {
            console.error('No authorization header');
            return res.status(401).json({
                message: "Authentication required. Please login."
            });
        }

        if (!req.headers.authorization.startsWith('Bearer ')) {
            console.error('Invalid authorization format');
            return res.status(401).json({
                message: "Invalid authorization format. Please login again."
            });
        }

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            console.error('No token provided');
            return res.status(401).json({
                message: "No authentication token. Please login again."
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified:', { userId: decoded?.id });
            req.userid = decoded?.id;
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: "Authentication token expired. Please login again."
                });
            }
            return res.status(401).json({
                message: "Invalid authentication token. Please login again."
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            message: "Authentication error",
            error: error.message
        });
    }
}

export default auth;