const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['education', 'healthcare', 'environment', 'disaster_relief', 'women_empowerment', 'child_welfare', 'senior_care', 'other'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1000, 'Minimum target amount is ₹1000']
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  donorCount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    caption: String,
    isMain: Boolean
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    images: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  impact: {
    beneficiaries: Number,
    locations: [String],
    outcomes: [String],
    metrics: [{
      name: String,
      value: String,
      unit: String
    }]
  },
  organization: {
    name: String,
    description: String,
    logo: String,
    website: String,
    is80GCertified: {
      type: Boolean,
      default: true
    }
  },
  team: [{
    name: String,
    role: String,
    photo: String,
    bio: String
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['80g_certificate', 'financial_report', 'annual_report', 'other']
    }
  }],
  socialShare: {
    facebook: String,
    twitter: String,
    whatsapp: String,
    email: String
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for percentage raised
campaignSchema.virtual('percentageRaised').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.raisedAmount / this.targetAmount) * 100, 100);
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
});

// Virtual for is urgent
campaignSchema.virtual('isUrgent').get(function() {
  return this.daysRemaining <= 7 && this.status === 'active';
});

// Indexes
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ featured: 1 });
campaignSchema.index({ endDate: 1 });
campaignSchema.index({ raisedAmount: -1 });

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Auto-complete campaign if end date passed
  if (this.endDate < new Date() && this.status === 'active') {
    this.status = 'completed';
  }
  
  // Auto-update status based on target
  if (this.raisedAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }
  
  next();
});

// Static method to get active campaigns
campaignSchema.statics.getActiveCampaigns = function(limit = 10) {
  return this.find({ 
    status: 'active', 
    isActive: true,
    endDate: { $gt: new Date() }
  })
  .sort({ featured: -1, raisedAmount: -1 })
  .limit(limit);
};

// Static method to get featured campaigns
campaignSchema.statics.getFeaturedCampaigns = function(limit = 5) {
  return this.find({ 
    featured: true, 
    status: 'active', 
    isActive: true 
  })
  .sort({ raisedAmount: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Campaign', campaignSchema);
