import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email template for payment receipt
const createReceiptEmail = (userData, paymentData) => {
  const { name, email, plan } = userData;
  const { amount, paymentId, orderId, date } = paymentData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - YourTube Premium</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3399cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .receipt { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3399cc; }
        .amount { font-size: 24px; color: #3399cc; font-weight: bold; }
        .details { margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>YourTube Premium</h1>
          <p>Payment Receipt</p>
        </div>
        
        <div class="content">
          <h2>Thank you for your purchase!</h2>
          <p>Dear ${name},</p>
          <p>Your payment has been processed successfully. Here are your receipt details:</p>
          
          <div class="receipt">
            <h3>Payment Details</h3>
            <div class="details">
              <strong>Plan:</strong> ${plan} Plan<br>
              <strong>Amount:</strong> <span class="amount">₹${amount}</span><br>
              <strong>Payment ID:</strong> ${paymentId}<br>
              <strong>Order ID:</strong> ${orderId}<br>
              <strong>Date:</strong> ${date}<br>
              <strong>Status:</strong> <span style="color: green;">✓ Paid</span>
            </div>
          </div>
          
          <p>Your plan is now active and you can enjoy all the premium features!</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The YourTube Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send payment receipt email
export const sendPaymentReceipt = async (userData, paymentData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: 'Payment Receipt - YourTube Premium',
      html: createReceiptEmail(userData, paymentData)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment receipt email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return { success: false, error: error.message };
  }
};

export const sendLoginOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login - YourTube',
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2>YourTube Login OTP</h2>
        <p>Your OTP for login is:</p>
        <div style="font-size: 2rem; font-weight: bold; color: #3399cc; margin: 16px 0;">${otp}</div>
        <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The YourTube Team</p>
      </div>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Login OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending login OTP email:', error);
    return { success: false, error: error.message };
  }
};

export default transporter; 