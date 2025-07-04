import express from "express"
import { login, upgradeUserPlan, createPaymentOrder, verifyPaymentSignature, sendLoginOtp, verifyLoginOtp } from "../Controllers/Auth.js"
import { updatechaneldata, getallchanels } from "../Controllers/channel.js";
import auth from "../middleware/auth.js";
import { sendSmsOtp, verifySmsOtp, sendSmsOtpByEmail } from '../Controllers/smsOtp.js';

const routes = express.Router();

routes.post('/login', login)
routes.post('/upgrade-plan/:id', auth, upgradeUserPlan)

// Payment routes
routes.post('/payment/create-order', auth, createPaymentOrder)
routes.post('/payment/verify', auth, verifyPaymentSignature)

routes.patch('/update/:id', auth, updatechaneldata)
routes.get('/getallchannel', getallchanels)

routes.post('/send-login-otp', sendLoginOtp)
routes.post('/verify-login-otp', verifyLoginOtp)
routes.post('/send-sms-otp', sendSmsOtp)
routes.post('/verify-sms-otp', verifySmsOtp)
routes.post('/send-sms-otp-by-email', sendSmsOtpByEmail)
routes.get('/test', (req, res) => res.json({ success: true, message: 'Test route works' }));

export default routes;