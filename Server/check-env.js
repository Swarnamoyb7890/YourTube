import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Checking YourTube environment variables...\n');

const requiredVars = {
    'Database': {
        'DB_URI': process.env.DB_URI,
        required: true
    },
    'JWT': {
        'JWT_SECRET': process.env.JWT_SECRET,
        required: true
    },
    'Razorpay': {
        'RAZORPAY_KEY_ID': process.env.RAZORPAY_KEY_ID,
        'RAZORPAY_KEY_SECRET': process.env.RAZORPAY_KEY_SECRET,
        required: false
    },
    'Email': {
        'EMAIL_USER': process.env.EMAIL_USER,
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
        required: false
    },
    'Twilio': {
        'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
        'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
        'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
        required: false
    },
    'Server': {
        'PORT': process.env.PORT || '5000',
        'FRONTEND_URL': process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app',
        required: false
    }
};

let allRequiredVarsSet = true;
let missingRequiredVars = [];

console.log('📋 Environment Variables Status:\n');

Object.entries(requiredVars).forEach(([category, vars]) => {
    console.log(`📁 ${category}:`);

    Object.entries(vars).forEach(([varName, value]) => {
        if (varName === 'required') return;

        const isRequired = vars.required;
        const isSet = value && value.trim() !== '';
        const status = isSet ? '✅' : (isRequired ? '❌' : '⚠️');
        const displayValue = isSet ? (varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('TOKEN') ? '***SET***' : value.substring(0, 20) + '...') : 'NOT SET';

        console.log(`  ${status} ${varName}: ${displayValue}`);

        if (isRequired && !isSet) {
            allRequiredVarsSet = false;
            missingRequiredVars.push(varName);
        }
    });
    console.log('');
});

console.log('📊 Summary:');
if (allRequiredVarsSet) {
    console.log('✅ All required environment variables are set!');
    console.log('🚀 Your server should start successfully.');
} else {
    console.log('❌ Missing required environment variables:');
    missingRequiredVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n⚠️  Please set the missing variables before deploying.');
}

console.log('\n💡 Optional services:');
console.log('   - Razorpay: For payment processing');
console.log('   - Email: For OTP and payment receipts');
console.log('   - Twilio: For SMS OTP');

console.log('\n🔧 To set environment variables in Render:');
console.log('   1. Go to your Render dashboard');
console.log('   2. Select your service');
console.log('   3. Go to Environment tab');
console.log('   4. Add the missing variables');
console.log('   5. Redeploy your service'); 