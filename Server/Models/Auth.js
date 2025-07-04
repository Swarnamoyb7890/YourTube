import mongoose from "mongoose";

const userschema = mongoose.Schema({
    email: { type: String, require: true },
    name: { type: String },
    desc: { type: String },
    joinedon: { type: Date, default: Date.now },
    plan: { type: String, enum: ['free', 'bronze', 'silver', 'gold'], default: 'free' },
    planPurchaseDate: { type: Date },
    planExpiryDate: { type: Date },
    mobile: { type: String }, // Added mobile field
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isOtpVerified: { type: Boolean, default: false }
})

export default mongoose.model("User", userschema)