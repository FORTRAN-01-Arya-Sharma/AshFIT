// This is the new, complete code for backend/config/email.js
const nodemailer = require('nodemailer');

// This function sets up a real SMTP transporter using your Gmail account
async function setupEmailTransporter() {
    // This configuration is for sending emails through Gmail
    return nodemailer.createTransport({
        service: 'gmail', // Use the built-in Gmail service
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address from .env
            pass: process.env.EMAIL_PASS, // Your 16-digit App Password from .env
        },
    });
}

module.exports = setupEmailTransporter;