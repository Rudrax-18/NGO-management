import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonors: 0,
    activeCampaigns: 0,
    pendingKYC: 0,
    flaggedDonations: 0,
    monthlyGrowth: 0,
    refundRate: 0,
    avgDonation: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [kycApplications, setKycApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalRaised: 2400000,
        totalDonors: 1247,
        activeCampaigns: 12,
        pendingKYC: 23,
        flaggedDonations: 8,
        monthlyGrowth: 15.3,
        refundRate: 2.1,
        avgDonation: 1924
      });

      setRecentDonations([
        {
          id: 1,
          donor: 'Rajesh Kumar',
          amount: 5000,
          status: 'confirmed',
          date: '2024-01-28',
          method: 'UPI',
          kycStatus: 'verified',
          riskScore: 5,
          campaign: 'Education for Every Child'
        },
        {
          id: 2,
          donor: 'Priya Sharma',
          amount: 25000,
          status: 'processing',
          date: '2024-01-28',
          method: 'Card',
          kycStatus: 'pending',
          riskScore: 25,
          campaign: 'Healthcare for Rural Areas'
        },
        {
          id: 3,
          donor: 'Amit Patel',
          amount: 1000,
          status: 'confirmed',
          date: '2024-01-27',
          method: 'NetBanking',
          kycStatus: 'verified',
          riskScore: 3,
          campaign: 'Clean Water Initiative'
        },
        {
          id: 4,
          donor: 'Anonymous',
          amount: 15000,
          status: 'flagged',
          date: '2024-01-27',
          method: 'UPI',
          kycStatus: 'verified',
          riskScore: 45,
          campaign: 'General Donation'
        },
        {
          id: 5,
          donor: 'Neha Gupta',
          amount: 3000,
          status: 'confirmed',
          date: '2024-01-26',
          method: 'Wallet',
          kycStatus: 'verified',
          riskScore: 8,
          campaign: 'Education for Every Child'
        }
      ]);

      setFraudAlerts([
        {
          id: 1,
          type: 'high_amount_new_user',
          donor: 'Priya Sharma',
          amount: 25000,
          riskScore: 25,
          description: 'New user with high donation amount',
          timestamp: '2 hours ago',
          action: 'Review Required'
        },
        {
          id: 2,
          type: 'rapid_donations',
          donor: 'Anonymous User',
          amount: 15000,
          riskScore: 45,
          description: 'Multiple donations in short time period',
          timestamp: '4 hours ago',
          action: 'Block Account'
        }
      ]);

      setKycApplications([
        {
          id: 1,
          name: 'Rahul Verma',
          email: 'rahul@example.com',
          submittedAt: '2024-01-28',
          status: 'pending',
          documents: ['PAN', 'Aadhaar', 'Photo'],
          panNumber: 'ABCDE1234F'
        },
        {
          id: 2,
          name: 'Anita Desai',
          email: 'anita@example.com',
          submittedAt: '2024-01-27',
          status: 'pending',
          documents: ['PAN', 'Aadhaar', 'Photo'],
          panNumber: 'FGHIJ5678K'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score) => {
    if (score >= 50) return 'text-red-600 bg-red-100';
    if (score >= 25) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleKYCAction = async (applicationId, action) => {
    try {
      // Mock API call
      console.log(`${action} KYC application ${applicationId}`);
      
      // Update local state
      setKycApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action === 'approve' ? 'verified' : 'rejected' }
            : app
        )
      );
      
      alert(`KYC application ${action}d successfully`);
    } catch (error) {
      console.error('KYC action failed:', error);
      alert('Failed to process KYC action');
    }
  };

  const handleFraudAction = async (alertId, action) => {
    try {
      // Mock API call
      console.log(`${action} fraud alert ${alertId}`);
      
      // Update local state
      setFraudAlerts(prev => 
        prev.filter(alert => alert.id !== alertId)
      );
      
      alert(`Fraud alert ${action}d successfully`);
    } catch (error) {
      console.error('Fraud action failed:', error);
      alert('Failed to process fraud action');
    }
  };

  const filteredDonations = recentDonations.filter(donation => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || donation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Impact Foundation</title>
        <meta name="description" content="Admin dashboard for managing donations, users, and system analytics." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Manage the NGO operations here.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">System Status</p>
                  <p className="text-sm font-medium text-green-600">All Systems Operational</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                  { id: 'donations', label: 'Donations', icon: CurrencyDollarIcon },
                  { id: 'users', label: 'Users', icon: UsersIcon },
                  { id: 'fraud', label: 'Fraud Detection', icon: ShieldCheckIcon },
                  { id: 'kyc', label: 'KYC Applications', icon: DocumentTextIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      +15.3%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">₹{(stats.totalRaised / 100000).toFixed(1)}L</h3>
                  <p className="text-gray-600 text-sm">Total Raised</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-600 flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      +8.2%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalDonors.toLocaleString()}</h3>
                  <p className="text-gray-600 text-sm">Total Donors</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">Active</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</h3>
                  <p className="text-gray-600 text-sm">Campaigns</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-yellow-600">Alert</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</h3>
                  <p className="text-gray-600 text-sm">Pending KYC</p>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
                  <div className="space-y-3">
                    {recentDonations.slice(0, 5).map((donation) => (
                      <div key={donation.id} className="flex justify-between items-center py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">{donation.donor}</p>
                          <p className="text-sm text-gray-500">{donation.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{donation.amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Alerts</h3>
                  <div className="space-y-3">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.donor} • ₹{alert.amount.toLocaleString()} • {alert.timestamp}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(alert.riskScore)}`}>
                          Risk: {alert.riskScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* KYC Applications Tab */}
          {activeTab === 'kyc' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">KYC Applications</h3>
              <div className="space-y-4">
                {kycApplications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{application.name}</h4>
                        <p className="text-sm text-gray-500">{application.email}</p>
                        <p className="text-xs text-gray-400 mt-1">PAN: {application.panNumber}</p>
                        <p className="text-xs text-gray-400">Submitted: {application.submittedAt}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {application.documents.map((doc) => (
                            <span key={doc} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        {application.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleKYCAction(application.id, 'approve')}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Approve"
                            >
                              <HandThumbUpIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleKYCAction(application.id, 'reject')}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Reject"
                            >
                              <HandThumbDownIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Fraud Detection Tab */}
          {activeTab === 'fraud' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Fraud Detection Alerts</h3>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                          <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(alert.riskScore)}`}>
                            Risk Score: {alert.riskScore}
                          </span>
                          <span className="text-xs text-gray-500">{alert.timestamp}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{alert.description}</h4>
                        <p className="text-sm text-gray-600">
                          Donor: {alert.donor} • Amount: ₹{alert.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Recommended Action: {alert.action}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleFraudAction(alert.id, 'review')}
                          className="btn-primary px-3 py-1 text-sm"
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => handleFraudAction(alert.id, 'ignore')}
                          className="btn-outline px-3 py-1 text-sm"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
