const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Minimum donation amount is ₹1']
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    cardLast4: String,
    bankName: String,
    walletType: String,
    upiId: String
  },
  status: {
    type: String,
    enum: ['processing', 'confirmed', 'settled', 'failed', 'refunded', 'flagged'],
    default: 'processing'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  deviceInfo: String,
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  fraudFlags: {
    isNewAccount: {
      type: Boolean,
      default: false
    },
    isHighAmount: {
      type: Boolean,
      default: false
    },
    isSuspiciousIP: {
      type: Boolean,
      default: false
    },
    multipleRefunds: {
      type: Boolean,
      default: false
    },
    rapidDonations: {
      type: Boolean,
      default: false
    }
  },
  processingDate: Date,
  confirmedDate: Date,
  settledDate: Date,
  refundDate: Date,
  refundReason: String,
  adminNotes: String,
  taxCertificate: {
    generated: {
      type: Boolean,
      default: false
    },
    certificateUrl: String,
    generatedDate: Date
  },
  recurringDonation: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    nextDonationDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  comments: String,
  receiptEmailSent: {
    type: Boolean,
    default: false
  },
  eightyGBenefit: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
donationSchema.index({ donorId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ amount: -1 });
donationSchema.index({ ipAddress: 1 });
donationSchema.index({ 'fraudFlags.isNewAccount': 1 });
donationSchema.index({ 'fraudFlags.isHighAmount': 1 });

// Virtual for days since donation
donationSchema.virtual('daysSinceDonation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is eligible for refund (7-day window)
donationSchema.virtual('isRefundEligible').get(function() {
  return this.status === 'processing' && this.daysSinceDonation < 7;
});

// Pre-save middleware for fraud detection
donationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const donor = await User.findById(this.donorId);
    
    // Check if new account (created within 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.fraudFlags.isNewAccount = donor.createdAt > thirtyDaysAgo;
    
    // Check if high amount (>₹5000)
    this.fraudFlags.isHighAmount = this.amount > 5000;
    
    // Check for rapid donations from same IP
    const recentDonations = await this.constructor.countDocuments({
      ipAddress: this.ipAddress,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
    });
    this.fraudFlags.rapidDonations = recentDonations > 3;
    
    // Auto-flag suspicious donations
    if ((this.fraudFlags.isNewAccount && this.fraudFlags.isHighAmount) || 
        this.fraudFlags.rapidDonations) {
      this.status = 'flagged';
    }
  }
  
  next();
});

// Static method to get donation statistics
donationSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        processingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        settledCount: {
          $sum: { $cond: [{ $eq: ['$status', 'settled'] }, 1, 0] }
        },
        flaggedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAmount: 0,
    totalDonations: 0,
    averageAmount: 0,
    processingCount: 0,
    confirmedCount: 0,
    settledCount: 0,
    flaggedCount: 0
  };
};

// Static method to get monthly trends
donationSchema.statics.getMonthlyTrends = async function(year = new Date().getFullYear()) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Donation', donationSchema);
