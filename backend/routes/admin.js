const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin', 'ngo_staff'));

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const donationStats = await Donation.getStatistics();
    const monthlyTrends = await Donation.getMonthlyTrends();
    
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$kycStatus', 'verified'] }, 1, 0] }
          },
          pendingKYC: {
            $sum: { $cond: [{ $eq: ['$kycStatus', 'pending'] }, 1, 0] }
          },
          activeDonors: {
            $sum: { $cond: [{ $gt: ['$donationCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Get campaign statistics
    const campaignStats = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRaised: { $sum: '$raisedAmount' }
        }
      }
    ]);

    // Get recent donations
    const recentDonations = await Donation.find()
      .populate('donorId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get flagged donations
    const flaggedDonations = await Donation.find({ status: 'flagged' })
      .populate('donorId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        donationStats: donationStats || {
          totalAmount: 0,
          totalDonations: 0,
          averageAmount: 0,
          processingCount: 0,
          confirmedCount: 0,
          settledCount: 0,
          flaggedCount: 0
        },
        userStats: userStats[0] || {
          totalUsers: 0,
          verifiedUsers: 0,
          pendingKYC: 0,
          activeDonors: 0
        },
        campaignStats: campaignStats[0] || {
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0,
          totalRaised: 0
        },
        monthlyTrends,
        recentDonations,
        flaggedDonations
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// Get all donations with pagination and filters
router.get('/donations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status, startDate, endDate, minAmount, maxAmount, search } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    
    // Search by donor name or email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.donorId = { $in: users.map(u => u._id) };
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email phone kycStatus createdAt')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(filter);

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
    console.error('Admin donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donations'
    });
  }
});

// Update donation status
router.put('/donations/:donationId/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['processing', 'confirmed', 'settled', 'failed', 'refunded', 'flagged'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const donation = await Donation.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Update status and timestamps
    donation.status = status;
    if (adminNotes) donation.adminNotes = adminNotes;
    
    switch (status) {
      case 'confirmed':
        donation.confirmedDate = new Date();
        break;
      case 'settled':
        donation.settledDate = new Date();
        if (!donation.confirmedDate) donation.confirmedDate = new Date();
        break;
      case 'refunded':
        donation.refundDate = new Date();
        break;
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Donation status updated successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating donation status'
    });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { role, kycStatus, search } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// Update user KYC status
router.put('/users/:userId/kyc', async (req, res) => {
  try {
    const { kycStatus, adminNotes } = req.body;
    
    if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.kycStatus = kycStatus;
    if (adminNotes) user.adminNotes = adminNotes;
    
    await user.save();

    res.json({
      success: true,
      message: 'User KYC status updated successfully',
      data: { 
        userId: user._id,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating KYC status'
    });
  }
});

// Get fraud detection report
router.get('/fraud-report', async (req, res) => {
  try {
    // Get suspicious donations
    const suspiciousDonations = await Donation.find({
      $or: [
        { 'fraudFlags.isNewAccount': true, 'fraudFlags.isHighAmount': true },
        { 'fraudFlags.rapidDonations': true },
        { 'fraudFlags.isSuspiciousIP': true }
      ]
    })
    .populate('donorId', 'name email createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

    // Get IP-based statistics
    const ipStats = await Donation.aggregate([
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          uniqueDonors: { $addToSet: '$donorId' }
        }
      },
      {
        $addFields: {
          uniqueDonorCount: { $size: '$uniqueDonors' }
        }
      },
      {
        $match: {
          $or: [
            { count: { $gt: 5 } },
            { totalAmount: { $gt: 50000 } },
            { uniqueDonorCount: { $gt: 3 } }
          ]
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Get new user donations
    const newUsersDonations = await Donation.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'donorId',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $match: {
          'donor.createdAt': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          },
          amount: { $gt: 5000 }
        }
      },
      {
        $group: {
          _id: '$donorId',
          donor: { $first: '$donor' },
          donations: { $push: '$$ROOT' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: {
        suspiciousDonations,
        ipStats,
        newUsersDonations
      }
    });
  } catch (error) {
    console.error('Fraud report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating fraud report'
    });
  }
});

// Get location-based statistics
router.get('/location-stats', async (req, res) => {
  try {
    const locationStats = await Donation.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'donorId',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $group: {
          _id: {
            city: '$donor.kycDetails.city',
            state: '$donor.kycDetails.state'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          uniqueDonors: { $addToSet: '$donorId' }
        }
      },
      {
        $addFields: {
          uniqueDonorCount: { $size: '$uniqueDonors' },
          city: { $ifNull: ['$_id.city', 'Unknown'] },
          state: { $ifNull: ['$_id.state', 'Unknown'] }
        }
      },
      {
        $project: {
          _id: 0,
          city: 1,
          state: 1,
          totalAmount: 1,
          count: 1,
          uniqueDonorCount: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      data: { locationStats }
    });
  } catch (error) {
    console.error('Location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching location statistics'
    });
  }
});

module.exports = router;
