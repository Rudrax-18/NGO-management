const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration - commented out for development
// const transporter = nodemailer.createTransporter({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// Mock email transporter for development
const transporter = {
  sendMail: async (options) => {
    console.log('📧 Email would be sent:', options.subject);
    console.log('📧 To:', options.to);
    console.log('📧 OTP (for testing):', options.html.match(/\d{6}/)?.[0] || 'N/A');
    return Promise.resolve();
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for login
router.post('/send-login-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to user document
    user.otp = {
      hash: otpHash,
      expiry: otpExpiry,
      attempts: 0
    };
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Login OTP - Impact Foundation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Impact Foundation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure Login Verification</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Your One-Time Password (OTP)</h2>
            <div style="background: white; border: 2px dashed #10b981; padding: 20px; text-align: center; border-radius: 8px;">
              <p style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">
              This OTP will expire in <strong>5 minutes</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message from Impact Foundation.</p>
            <p>For security reasons, never share your OTP with anyone.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email: email,
        expiresIn: 300 // 5 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Send OTP for registration
router.post('/send-register-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in temporary session (you could use Redis for production)
    const tempOTP = {
      email,
      hash: otpHash,
      expiry: otpExpiry,
      attempts: 0
    };

    // For now, store in user document with a special flag
    await User.deleteOne({ email, isTemporary: true });
    await User.create({
      email,
      otp: tempOTP,
      isTemporary: true
    });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Impact Foundation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Impact Foundation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Thank you for signing up! Please use the OTP below to verify your email address:
            </p>
            <div style="background: white; border: 2px dashed #3b82f6; padding: 20px; text-align: center; border-radius: 8px;">
              <p style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">
              This OTP will expire in <strong>5 minutes</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't sign up for Impact Foundation, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message from Impact Foundation.</p>
            <p>For security reasons, never share your OTP with anyone.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Verification OTP sent successfully to your email',
      data: {
        email: email,
        expiresIn: 300 // 5 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Send register OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP
router.post('/verify', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('type').isIn(['login', 'register']).withMessage('Invalid verification type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, otp, type } = req.body;

    // Find user with OTP
    let user;
    if (type === 'register') {
      user = await User.findOne({ email, isTemporary: true });
    } else {
      user = await User.findOne({ email });
    }

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (user.otp.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.otp.hash) {
      user.otp.attempts += 1;
      await user.save();
      
      const remainingAttempts = 3 - user.otp.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    
    if (type === 'register') {
      // For registration, mark email as verified
      user.emailVerified = true;
      user.isTemporary = false;
      user.emailVerifiedAt = new Date();
    }
    
    await user.save();

    // Generate JWT token for login
    let token = null;
    if (type === 'login') {
      token = user.getAuthToken();
    }

    res.json({
      success: true,
      message: type === 'login' ? 'OTP verified successfully' : 'Email verified successfully',
      data: {
        email: email,
        token: token,
        user: type === 'login' ? {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus
        } : null
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// Resend OTP
router.post('/resend', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('type').isIn(['login', 'register']).withMessage('Invalid verification type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, type } = req.body;

    // Check rate limiting (max 3 OTPs per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    let user;
    if (type === 'register') {
      user = await User.findOne({ email, isTemporary: true });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.lastOTPSent && user.lastOTPSent > oneHourAgo && user.otpRequestCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update OTP and tracking
    user.otp = {
      hash: otpHash,
      expiry: otpExpiry,
      attempts: 0
    };
    user.lastOTPSent = new Date();
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    await user.save();

    // Send OTP email (reuse the email sending logic from above)
    // ... (email sending code)

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        email: email,
        expiresIn: 300
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

module.exports = router;
