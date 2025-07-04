import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
import users from '../Models/Auth.js';
import { sendPaymentReceipt } from '../Helper/emailService.js';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // amount in paise
            currency: currency || 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        // Log the full error object
        console.error('Error creating Razorpay order:', error, error?.message, error?.stack);
        res.status(500).json({ error: error.message, details: error });
    }
};

export const verifyPayment = async (req, res) => {
    console.log('Payment verification request received:', req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userId } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    console.log('Verifying signature for order:', razorpay_order_id);
    const generated_signature = crypto.createHmac('sha256', key_secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    console.log('Generated signature:', generated_signature);
    console.log('Received signature:', razorpay_signature);

    if (generated_signature === razorpay_signature) {
        console.log('Signature verified successfully!');
        console.log('Updating plan for user:', userId, 'to plan:', plan);

        try {
            // Update user's plan in database
            const updatedUser = await users.findByIdAndUpdate(
                userId,
                {
                    plan: plan,
                    planPurchaseDate: new Date(),
                    planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                },
                { new: true }
            );

            if (!updatedUser) {
                console.log('User not found:', userId);
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            console.log('Plan updated successfully for user:', updatedUser.email);

            // Send payment receipt email
            const paymentData = {
                amount: req.body.amount || '100', // Get amount from frontend
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                date: new Date().toLocaleString()
            };

            const userData = {
                name: updatedUser.name || updatedUser.email,
                email: updatedUser.email,
                plan: plan
            };

            // Send email (don't wait for it to complete)
            sendPaymentReceipt(userData, paymentData)
                .then(result => {
                    if (result.success) {
                        console.log('Payment receipt email sent successfully');
                    } else {
                        console.log('Failed to send payment receipt email:', result.error);
                    }
                })
                .catch(error => {
                    console.log('Error sending payment receipt email:', error);
                });

            return res.json({
                success: true,
                user: updatedUser,
                message: 'Payment verified and plan upgraded successfully'
            });
        } catch (error) {
            console.error('Error updating user plan:', error);
            return res.status(500).json({ success: false, error: 'Failed to update plan' });
        }
    } else {
        console.log('Signature verification failed!');
        return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
}; 