const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { authenticate, requireKYC, sensitiveOperation } = require('../middleware/auth');
const { detectFraud, antiRefundProtection } = require('../middleware/fraudDetection');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create donation order
router.post('/create-order', authenticate, detectFraud, [
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 1 }).withMessage('Minimum amount is ₹1'),
  body('paymentMethod').isIn(['upi', 'card', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
  body('campaignId').optional().isMongoId().withMessage('Invalid campaign ID'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments cannot exceed 500 characters')
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

    const { amount, paymentMethod, isAnonymous = false, campaignId, comments } = req.body;

    // Check if KYC is required for this amount
    if (amount > 10000 && req.user.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification is required for donations above ₹10,000',
        kycRequired: true
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        email: req.user.email,
        paymentMethod,
        isAnonymous,
        campaignId: campaignId || null
      }
    };

    const order = await razorpay.orders.create(options);

    // Create donation record
    const donation = new Donation({
      donorId: req.user._id,
      amount,
      paymentMethod,
      paymentDetails: {
        razorpayOrderId: order.id,
        transactionId: order.receipt
      },
      isAnonymous,
      isPublic: !isAnonymous,
      kycVerified: req.user.kycStatus === 'verified',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      campaign: campaignId,
      comments
    });

    await donation.save();

    res.json({
      success: true,
      message: 'Donation order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        donationId: donation._id
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating donation order'
    });
  }
});

// Verify payment
router.post('/verify-payment', authenticate, sensitiveOperation, [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
  body('donationId').isMongoId().withMessage('Invalid donation ID')
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update donation record
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    // Verify this donation belongs to the authenticated user
    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to donation'
      });
    }

    // Update payment details
    donation.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    donation.paymentDetails.razorpaySignature = razorpay_signature;
    donation.status = 'confirmed';
    donation.confirmedDate = new Date();

    await donation.save();

    // Update user's donation statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalDonations: donation.amount,
        donationCount: 1
      }
    });

    // TODO: Send receipt email
    // TODO: Generate 80G certificate

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        donationId: donation._id,
        amount: donation.amount,
        status: donation.status,
        receiptUrl: `/api/donations/receipt/${donation._id}`
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// Get user's donation history
router.get('/my-donations', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const donations = await Donation.find({ donorId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('campaign', 'title category')
      .select('-paymentDetails.razorpaySignature');

    const total = await Donation.countDocuments({ donorId: req.user._id });

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donation history'
    });
  }
});

// Get donation details
router.get('/:donationId', authenticate, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('donorId', 'name email')
      .populate('campaign', 'title category description');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if user owns this donation or is admin
    if (donation.donorId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to donation details'
      });
    }

    res.json({
      success: true,
      data: { donation }
    });
  } catch (error) {
    console.error('Donation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donation details'
    });
  }
});

// Download receipt
router.get('/receipt/:donationId', authenticate, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('donorId', 'name email phone address city state pincode');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if user owns this donation or is admin
    if (donation.donorId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to receipt'
      });
    }

    // TODO: Generate PDF receipt
    // For now, return receipt data
    const receiptData = {
      receiptNumber: `RCP-${Date.now()}`,
      donationId: donation._id,
      donorName: donation.donorId.name,
      donorEmail: donation.donorId.email,
      amount: donation.amount,
      date: donation.confirmedDate || donation.createdAt,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.paymentDetails.transactionId,
      eightyGBenefit: donation.eightyGBenefit,
      ngoName: 'Impact Foundation',
      ngoAddress: 'Jamnagar, Gujarat, India',
      eightyGNumber: '80G(123)/2020-21'
    };

    res.json({
      success: true,
      data: { receipt: receiptData }
    });
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating receipt'
    });
  }
});

// Request refund (with anti-refund protection)
router.post('/refund/:donationId', authenticate, antiRefundProtection, [
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10-500 characters')
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

    const { donationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only request refund for your own donations'
      });
    }

    // Additional refund checks
    const daysSince = (Date.now() - new Date(donation.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) {
      return res.status(400).json({
        success: false,
        message: 'Refunds are not allowed within 7 days of donation for security reasons.'
      });
    }

    if (donation.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been refunded.'
      });
    }

    if (donation.status !== 'confirmed' && donation.status !== 'settled') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed donations can be refunded.'
      });
    }

    // Update donation status
    donation.status = 'refund_requested';
    donation.refundReason = reason;
    donation.refundRequestedAt = new Date();
    await donation.save();

    // TODO: Send notification to admin for approval

    res.json({
      success: true,
      message: 'Refund request submitted successfully. It will be reviewed by our team.',
      data: {
        donationId: donation._id,
        status: 'refund_requested',
        expectedProcessingTime: '7-10 business days'
      }
    });
  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund request'
    });
  }
});

// Get public donation statistics
router.get('/stats/public', async (req, res) => {
  try {
    const stats = await Donation.getStatistics();
    
    // Get recent public donations
    const recentDonations = await Donation.find({ 
      isPublic: true, 
      status: { $in: ['confirmed', 'settled'] } 
    })
    .populate('donorId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('amount createdAt isAnonymous donorId');

    res.json({
      success: true,
      data: {
        totalRaised: stats.totalAmount,
        totalDonors: stats.totalDonations,
        averageDonation: stats.averageAmount,
        recentDonations: recentDonations.map(d => ({
          amount: d.amount,
          date: d.createdAt,
          isAnonymous: d.isAnonymous,
          donorName: d.isAnonymous ? 'Anonymous' : d.donorId?.name || 'Anonymous'
        }))
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public statistics'
    });
  }
});

module.exports = router;
