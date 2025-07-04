import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// In-memory store for OTPs: { [mobile]: { otp, expiresAt } }
const smsOtps = {};

// New: Send SMS OTP to registered mobile by email
import users from '../Models/Auth.js';

export const sendSmsOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ success: false, error: 'Mobile number is required' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        smsOtps[mobile] = { otp, expiresAt };

        // Send OTP via Twilio
        await client.messages.create({
            body: `Your OTP for login is: ${otp} (valid for 5 minutes)`,
            from: twilioPhone,
            to: mobile
        });

        res.json({ success: true, message: 'OTP sent to mobile' });
    } catch (error) {
        console.error('Error sending SMS OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to send SMS OTP' });
    }
};

export const verifySmsOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
        const record = smsOtps[mobile];
        if (!record) return res.status(400).json({ success: false, error: 'No OTP requested for this number' });
        if (record.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });
        if (record.expiresAt < Date.now()) return res.status(400).json({ success: false, error: 'OTP expired' });
        // OTP verified, remove from store
        delete smsOtps[mobile];
        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying SMS OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to verify SMS OTP' });
    }
};

export const sendSmsOtpByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
        const user = await users.findOne({ email });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (!user.mobile) return res.status(400).json({ success: false, error: 'No mobile number registered for this user' });
        const mobile = user.mobile;
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        smsOtps[mobile] = { otp, expiresAt };
        // Send OTP via Twilio
        await client.messages.create({
            body: `Your OTP for login is: ${otp} (valid for 5 minutes)`,
            from: twilioPhone,
            to: mobile
        });
        res.json({ success: true, message: 'OTP sent to registered mobile' });
    } catch (error) {
        console.error('Error sending SMS OTP by email:', error);
        res.status(500).json({ success: false, error: 'Failed to send SMS OTP' });
    }
}; 