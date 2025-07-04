# YourTube - Video Sharing Platform

A full-stack video sharing platform built with React, Node.js, and MongoDB. Features include video upload/streaming, user authentication, group chat, payment integration, and more.

## 🚀 Features

- **Video Management**: Upload, stream, like, and save videos
- **User Authentication**: Google OAuth with email/SMS OTP verification
- **Group Chat**: Real-time messaging with persistent storage
- **Payment Integration**: Razorpay payment gateway for premium plans
- **Responsive Design**: Mobile-friendly interface
- **Security**: JWT authentication, CORS protection, file validation

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- Redux Toolkit
- React Router DOM
- Axios for API calls
- React Icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Nodemailer for email services
- Twilio for SMS OTP

### External Services
- Google OAuth
- Razorpay Payment Gateway
- Twilio SMS Service
- Netlify (Frontend Deployment)
- Render (Backend Deployment)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Google OAuth credentials
- Razorpay account
- Twilio account
- Email service (Gmail recommended)

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
REACT_APP_VIDEO_BASE_URL=https://your-backend-url.onrender.com
```

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd yourtube-main
```

### 2. Install dependencies

**Backend:**
```bash
cd Server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Configure environment variables
- Copy the environment variables above to respective `.env` files
- Update with your actual credentials

### 4. Start the development servers

**Backend:**
```bash
cd Server
npm start
```

**Frontend:**
```bash
cd client
npm start
```

## 📁 Project Structure

```
yourtube-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── action/        # Redux actions
│   │   ├── Api/           # API configuration
│   │   ├── Component/     # React components
│   │   ├── Pages/         # Page components
│   │   └── Reducers/      # Redux reducers
│   └── public/
├── Server/                 # Node.js backend
│   ├── Controllers/       # Route controllers
│   ├── Models/            # MongoDB models
│   ├── Routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── uploads/           # Video storage
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- CORS protection with allowed origins
- File upload validation (MP4 only, size limits)
- Input sanitization
- Security headers (XSS protection, content type options)
- Rate limiting and error handling

## 🚀 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables in Netlify dashboard

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Configure environment variables in Render dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: Make sure to configure all environment variables before deploying to production.
