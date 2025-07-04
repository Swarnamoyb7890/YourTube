import dotenv from "dotenv";
dotenv.config();

import users from "../Models/Auth.js";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendPaymentReceipt, sendLoginOtpEmail } from '../Helper/emailService.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const login = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      try {
        const newUser = await users.create({ email });

        const token = jwt.sign(
          { email: newUser.email, id: newUser._id },
          process.env.JWT_SECRET, // ✅ fixed spelling
          { expiresIn: "1h" }
        );

        return res.status(200).json({ result: newUser, token });
      } catch (error) {
        console.error("User creation error:", error);
        return res.status(500).json({ mess: "Something went wrong", error: error.message });
      }
    } else {
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ result: existingUser, token });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ mess: "Something went wrong", error: error.message });
  }
};

export const upgradeUserPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;
    if (!['bronze', 'silver', 'gold'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected.' });
    }
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.plan = plan;
    user.planPurchaseDate = new Date();
    await user.save();
    // TODO: Trigger email with invoice here
    res.status(200).json({ message: 'Plan upgraded successfully.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error upgrading plan', error: error.message });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, plan, userId } = req.body;

    if (!amount || !plan || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan,
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

export const verifyPaymentSignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userId } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update user plan
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plan = plan;
    user.planPurchaseDate = new Date();
    user.planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and plan upgraded successfully',
      user: user
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Generate and send OTP after Google login
export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    // Find user
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.isOtpVerified = false;
    await user.save();

    // Send OTP email
    await sendLoginOtpEmail(user.email, otp);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP are required' });

    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.otp || !user.otpExpiresAt) return res.status(400).json({ success: false, error: 'No OTP requested' });
    if (user.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ success: false, error: 'OTP expired' });

    user.isOtpVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'OTP verified successfully', user });
  } catch (error) {
    console.error('Error verifying login OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};
