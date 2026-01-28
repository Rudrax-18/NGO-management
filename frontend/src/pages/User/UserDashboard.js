import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  DocumentTextIcon, 
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { userAPI } from '../../utils/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    thisYearDonated: 0,
    taxCertificates: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockDonations = [
        {
          id: 1,
          amount: 5000,
          date: '2024-01-28',
          status: 'confirmed',
          campaign: 'Education for Every Child',
          taxCertificate: true,
          receiptUrl: '/receipts/donation-1.pdf'
        },
        {
          id: 2,
          amount: 10000,
          date: '2024-01-15',
          status: 'confirmed',
          campaign: 'Healthcare for Rural Areas',
          taxCertificate: true,
          receiptUrl: '/receipts/donation-2.pdf'
        },
        {
          id: 3,
          amount: 2500,
          date: '2024-01-05',
          status: 'processing',
          campaign: 'Clean Water Initiative',
          taxCertificate: false,
          receiptUrl: null
        }
      ];

      const mockStats = {
        totalDonated: 17500,
        donationCount: 12,
        thisYearDonated: 17500,
        taxCertificates: 10
      };

      setDonations(mockDonations);
      setStats(mockStats);
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
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing': return <ClockIcon className="h-4 w-4" />;
      case 'flagged': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

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
        <title>Dashboard - Impact Foundation</title>
        <meta name="description" content="Your personal dashboard to manage donations and track impact." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your donations and track your impact here.
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    user?.kycStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                    KYC: {user?.kycStatus || 'Not Submitted'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Member since {new Date(user?.createdAt).getFullYear()}</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Total Impact</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">₹{(stats.totalDonated / 1000).toFixed(1)}K</h3>
              <p className="text-gray-600 text-sm">Total Donated</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GiftIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-600">Generosity</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.donationCount}</h3>
              <p className="text-gray-600 text-sm">Donations Made</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600">This Year</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">₹{(stats.thisYearDonated / 1000).toFixed(1)}K</h3>
              <p className="text-gray-600 text-sm">2024 Contributions</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-yellow-600">Tax Benefits</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.taxCertificates}</h3>
              <p className="text-gray-600 text-sm">80G Certificates</p>
            </div>
          </motion.div>

          {/* KYC Status Alert */}
          {user?.kycStatus !== 'verified' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-2">Complete Your KYC Verification</h3>
                  <p className="text-yellow-700 mb-4">
                    Complete your KYC verification to unlock unlimited donation limits and access all platform features.
                  </p>
                  <button 
                    onClick={() => navigate('/kyc')}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Complete KYC Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Donations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Donations</h2>
                  <button 
                    onClick={() => navigate('/donation-history')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    View All
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                              {getStatusIcon(donation.status)}
                              <span className="ml-1">{donation.status}</span>
                            </span>
                            <span className="text-xs text-gray-500">{donation.date}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{donation.campaign}</h4>
                          <p className="text-lg font-semibold text-primary-600">₹{donation.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          {donation.receiptUrl && (
                            <button className="text-sm text-primary-600 hover:text-primary-700">
                              Download Receipt
                            </button>
                          )}
                          {donation.taxCertificate && (
                            <div>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                80G Available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/donate')}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    <HeartIcon className="h-5 w-5" />
                    <span>Make a Donation</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/donation-history')}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Donation History</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/tax-certificates')}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Tax Certificates</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/kyc')}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>KYC Verification</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              {/* Impact Card */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-md p-6 mt-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Your Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-100">Lives Impacted</span>
                    <span className="font-bold">{Math.floor(stats.totalDonated / 100)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-100">Children Educated</span>
                    <span className="font-bold">{Math.floor(stats.totalDonated / 500)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-100">Families Helped</span>
                    <span className="font-bold">{Math.floor(stats.totalDonated / 1000)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-500">
                  <p className="text-sm text-primary-100">
                    Thank you for being a changemaker! Your contributions are making a real difference.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
