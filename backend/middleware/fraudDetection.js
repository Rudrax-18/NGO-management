const Donation = require('../models/Donation');
const User = require('../models/User');

// Fraud detection rules
const FRAUD_RULES = {
  NEW_ACCOUNT_HIGH_AMOUNT: {
    condition: (donation, user) => {
      const accountAge = new Date() - new Date(user.createdAt);
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      return daysOld < 7 && donation.amount > 5000;
    },
    risk: 'HIGH',
    action: 'FLAG_FOR_REVIEW'
  },
  SAME_IP_MULTIPLE_REFUNDS: {
    condition: async (donation, user) => {
      const recentRefunds = await Donation.countDocuments({
        ipAddress: donation.ipAddress,
        status: 'refunded',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });
      return recentRefunds >= 2;
    },
    risk: 'CRITICAL',
    action: 'BLOCK_ACCOUNT'
  },
  RAPID_MULTIPLE_DONATIONS: {
    condition: async (donation, user) => {
      const recentDonations = await Donation.countDocuments({
        userId: user._id,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last 1 hour
      });
      return recentDonations >= 5;
    },
    risk: 'MEDIUM',
    action: 'FLAG_FOR_REVIEW'
  },
  SUSPICIOUS_AMOUNT_PATTERN: {
    condition: (donation, user) => {
      // Check for round numbers often used for testing
      return [1000, 2000, 5000, 10000].includes(donation.amount) && 
             donation.amount > 2000 && 
             user.totalDonations === 0;
    },
    risk: 'MEDIUM',
    action: 'FLAG_FOR_REVIEW'
  },
  PUBLIC_DONATION_HIGH_AMOUNT: {
    condition: (donation, user) => {
      return !donation.isAnonymous && 
             donation.amount > 10000 && 
             user.totalDonations === 0;
    },
    risk: 'HIGH',
    action: 'FLAG_FOR_REVIEW'
  }
};

// Advanced fraud detection with machine learning-like scoring
const calculateRiskScore = async (donation, user) => {
  let riskScore = 0;
  const flaggedRules = [];

  for (const [ruleName, rule] of Object.entries(FRAUD_RULES)) {
    try {
      const isFlagged = await rule.condition(donation, user);
      if (isFlagged) {
        switch (rule.risk) {
          case 'CRITICAL':
            riskScore += 50;
            break;
          case 'HIGH':
            riskScore += 25;
            break;
          case 'MEDIUM':
            riskScore += 10;
            break;
        }
        flaggedRules.push({ rule: ruleName, risk: rule.risk, action: rule.action });
      }
    } catch (error) {
      console.error(`Error in fraud rule ${ruleName}:`, error);
    }
  }

  // Additional risk factors
  if (user.kycStatus !== 'verified') {
    riskScore += 15;
  }

  if (donation.amount > 50000) {
    riskScore += 20;
  }

  // Device and location analysis
  const deviceFingerprint = donation.deviceInfo || '';
  if (deviceFingerprint.includes('bot') || deviceFingerprint.includes('crawler')) {
    riskScore += 30;
  }

  return {
    score: Math.min(riskScore, 100),
    level: riskScore >= 50 ? 'CRITICAL' : riskScore >= 25 ? 'HIGH' : riskScore >= 10 ? 'MEDIUM' : 'LOW',
    flaggedRules,
    recommendation: riskScore >= 50 ? 'BLOCK' : riskScore >= 25 ? 'MANUAL_REVIEW' : 'ALLOW'
  };
};

// Anti-refund protection
const ANTI_REFUND_RULES = {
  SEVEN_DAY_HOLD: {
    condition: (donation) => {
      const daysSince = (Date.now() - new Date(donation.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSince < 7;
    },
    message: 'Refunds are not allowed within 7 days of donation for security reasons.'
  },
  PUBLIC_DONATION_NO_REFUND: {
    condition: (donation) => {
      return !donation.isAnonymous && donation.amount > 1000;
    },
    message: 'Public donations are non-refundable as per our policy.'
  },
  ALREADY_REFUNDED: {
    condition: async (donationId) => {
      const donation = await Donation.findById(donationId);
      return donation.status === 'refunded';
    },
    message: 'This donation has already been refunded.'
  },
  FRAUD_FLAGGED: {
    condition: async (donationId) => {
      const donation = await Donation.findById(donationId);
      return donation.fraudFlags && donation.fraudFlags.length > 0;
    },
    message: 'Cannot refund flagged donations. Please contact support.'
  }
};

// Main fraud detection middleware
const detectFraud = async (req, res, next) => {
  try {
    const { amount, isAnonymous } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);
    const donation = {
      amount,
      isAnonymous,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      createdAt: new Date()
    };

    // Calculate risk score
    const riskAnalysis = await calculateRiskScore(donation, user);

    // Add fraud detection to request for later use
    req.fraudAnalysis = riskAnalysis;

    // Block critical risk donations
    if (riskAnalysis.level === 'CRITICAL') {
      return res.status(400).json({
        success: false,
        message: 'Donation flagged for security reasons. Please contact support.',
        riskAnalysis
      });
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(); // Continue on error to avoid blocking legitimate donations
  }
};

// Anti-refund protection middleware
const antiRefundProtection = async (req, res, next) => {
  try {
    const donationId = req.params.id || req.body.donationId;

    for (const [ruleName, rule] of Object.entries(ANTI_REFUND_RULES)) {
      try {
        const isBlocked = await rule.condition(donationId, req.body);
        if (isBlocked) {
          return res.status(400).json({
            success: false,
            message: rule.message,
            blockedBy: ruleName
          });
        }
      } catch (error) {
        console.error(`Error in anti-refund rule ${ruleName}:`, error);
      }
    }

    next();
  } catch (error) {
    console.error('Anti-refund protection error:', error);
    next();
  }
};

// Real-time fraud monitoring
const monitorFraudPatterns = async () => {
  try {
    const suspiciousPatterns = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          $or: [
            { fraudFlags: { $exists: true, $ne: [] } },
            { amount: { $gt: 10000 } },
            { status: 'processing' }
          ]
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          flagged: { $sum: { $cond: [{ $gt: [{ $size: '$fraudFlags' }, 0] }, 1, 0] } }
        }
      },
      {
        $match: {
          $or: [
            { count: { $gt: 10 } },
            { totalAmount: { $gt: 50000 } },
            { flagged: { $gt: 0 } }
          ]
        }
      }
    ]);

    if (suspiciousPatterns.length > 0) {
      console.warn('Suspicious patterns detected:', suspiciousPatterns);
      // TODO: Send alert to admin
    }
  } catch (error) {
    console.error('Fraud monitoring error:', error);
  }
};

// Run fraud monitoring every hour
setInterval(monitorFraudPatterns, 60 * 60 * 1000);

module.exports = {
  detectFraud,
  antiRefundProtection,
  calculateRiskScore,
  FRAUD_RULES,
  ANTI_REFUND_RULES,
  monitorFraudPatterns
};
