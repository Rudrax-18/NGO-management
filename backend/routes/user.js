const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Donation = require('../models/Donation');

// All user routes require authentication
router.use(authenticate);

// Get user dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get user's donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { donorId: req.user._id } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          lastDonation: { $max: '$createdAt' }
        }
      }
    ]);

    // Get recent donations
    const recentDonations = await Donation.find({ donorId: req.user._id })
      .populate('campaign', 'title category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly donation trends for this user
    const monthlyTrends = await Donation.aggregate([
      { $match: { donorId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get tax certificates available
    const taxCertificates = await Donation.find({
      donorId: req.user._id,
      status: { $in: ['confirmed', 'settled'] },
      'taxCertificate.generated': true
    })
    .select('amount createdAt taxCertificate')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          kycStatus: req.user.kycStatus,
          totalDonations: req.user.totalDonations,
          donationCount: req.user.donationCount,
          memberSince: req.user.createdAt
        },
        stats: donationStats[0] || {
          totalAmount: 0,
          totalDonations: 0,
          averageAmount: 0,
          lastDonation: null
        },
        recentDonations,
        monthlyTrends,
        taxCertificates
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
});

// Get user's recurring donations
router.get('/recurring-donations', async (req, res) => {
  try {
    const recurringDonations = await Donation.find({
      donorId: req.user._id,
      'recurringDonation.isRecurring': true,
      'recurringDonation.isActive': true
    })
    .populate('campaign', 'title category')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { recurringDonations }
    });
  } catch (error) {
    console.error('Recurring donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recurring donations'
    });
  }
});

// Update recurring donation
router.put('/recurring-donations/:donationId', async (req, res) => {
  try {
    const { frequency, isActive } = req.body;
    
    const donation = await Donation.findOne({
      _id: req.params.donationId,
      donorId: req.user._id,
      'recurringDonation.isRecurring': true
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Recurring donation not found'
      });
    }

    if (frequency) {
      donation.recurringDonation.frequency = frequency;
    }
    
    if (typeof isActive === 'boolean') {
      donation.recurringDonation.isActive = isActive;
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Recurring donation updated successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Update recurring donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating recurring donation'
    });
  }
});

// Download tax certificates
router.get('/tax-certificates', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    const certificates = await Donation.find({
      donorId: req.user._id,
      status: { $in: ['confirmed', 'settled'] },
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    })
    .select('amount createdAt paymentDetails.transactionId')
    .sort({ createdAt: -1 });

    // Calculate yearly total
    const yearlyTotal = certificates.reduce((sum, cert) => sum + cert.amount, 0);

    res.json({
      success: true,
      data: {
        year,
        certificates,
        yearlyTotal,
        certificateUrl: `/api/user/tax-certificate/${year}`
      }
    });
  } catch (error) {
    console.error('Tax certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tax certificates'
    });
  }
});

// Download single tax certificate for a year
router.get('/tax-certificate/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    const donations = await Donation.find({
      donorId: req.user._id,
      status: { $in: ['confirmed', 'settled'] },
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    })
    .select('amount createdAt paymentDetails.transactionId')
    .sort({ createdAt: -1 });

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No donations found for the specified year'
      });
    }

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    // Generate certificate data
    const certificateData = {
      certificateNumber: `80G-${year}-${req.user._id.toString().slice(-6)}`,
      donorName: req.user.name,
      donorAddress: req.user.kycDetails?.address || 'Address not provided',
      donorCity: req.user.kycDetails?.city || 'City not provided',
      donorState: req.user.kycDetails?.state || 'State not provided',
      donorPincode: req.user.kycDetails?.pincode || '',
      donorPAN: req.user.kycDetails?.pan || '',
      financialYear: `${year}-${year + 1}`,
      totalAmount,
      donationCount: donations.length,
      donations: donations.map(d => ({
        amount: d.amount,
        date: d.createdAt,
        transactionId: d.paymentDetails.transactionId
      })),
      generatedOn: new Date(),
      ngoName: 'Impact Foundation',
      ngoAddress: '123, NGO Street, Jamnagar, Gujarat - 361001',
      ngoPAN: 'AAAPL1234C',
      eightyGNumber: '80G(123)/2020-21',
      signature: 'Authorized Signatory',
      seal: 'Official Seal'
    };

    // TODO: Generate PDF certificate
    // For now, return certificate data
    res.json({
      success: true,
      data: { certificate: certificateData }
    });
  } catch (error) {
    console.error('Tax certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating tax certificate'
    });
  }
});

// Get user's impact summary
router.get('/impact', async (req, res) => {
  try {
    const impactData = await Donation.aggregate([
      { $match: { donorId: req.user._id, status: { $in: ['confirmed', 'settled'] } } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: { path: '$campaign', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$campaign.category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          campaigns: { $addToSet: '$campaign.title' }
        }
      },
      {
        $project: {
          category: { $ifNull: ['$_id', 'General'] },
          totalAmount: 1,
          count: 1,
          campaigns: { $size: '$campaigns' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const totalImpact = await Donation.aggregate([
      { $match: { donorId: req.user._id, status: { $in: ['confirmed', 'settled'] } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          firstDonation: { $min: '$createdAt' },
          lastDonation: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        impactByCategory: impactData,
        totalImpact: totalImpact[0] || {
          totalAmount: 0,
          totalDonations: 0,
          firstDonation: null,
          lastDonation: null
        }
      }
    });
  } catch (error) {
    console.error('User impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact data'
    });
  }
});

module.exports = router;
