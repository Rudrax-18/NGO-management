import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { donationAPI } from '../utils/api';

const DonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [fraudWarning, setFraudWarning] = useState(null);

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // Mock campaigns data - replace with actual API call
      const mockCampaigns = [
        {
          id: 1,
          title: 'Education for Every Child',
          description: 'Providing quality education to underprivileged children across India',
          target: 1000000,
          raised: 750000,
          image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
          category: 'Education'
        },
        {
          id: 2,
          title: 'Healthcare for Rural Areas',
          description: 'Bringing medical facilities to remote villages and underserved communities',
          target: 2000000,
          raised: 1200000,
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop',
          category: 'Healthcare'
        },
        {
          id: 3,
          title: 'Clean Water Initiative',
          description: 'Installing water purification systems in villages lacking clean drinking water',
          target: 500000,
          raised: 350000,
          image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200&fit=crop',
          category: 'Environment'
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    checkFraudRisk(value);
  };

  const checkFraudRisk = (donationAmount) => {
    if (!donationAmount) {
      setFraudWarning(null);
      return;
    }

    const amount = parseInt(donationAmount);
    const warnings = [];

    // Check for new user high amount
    if (user && new Date() - new Date(user.createdAt) < 7 * 24 * 60 * 60 * 1000 && amount > 5000) {
      warnings.push('New account with high donation amount - additional verification required');
    }

    // Check for round numbers
    if ([1000, 2000, 5000, 10000].includes(amount) && amount > 2000) {
      warnings.push('Round number detected - verification may take longer');
    }

    // Check KYC status
    if (user?.kycStatus !== 'verified' && amount > 10000) {
      warnings.push('KYC verification required for donations above ₹10,000');
    }

    // Check public donation high amount
    if (!isAnonymous && amount > 10000 && user?.totalDonations === 0) {
      warnings.push('Public donations above ₹10,000 for first-time donors require additional verification');
    }

    setFraudWarning(warnings.length > 0 ? warnings : null);
  };

  const handleDonate = async () => {
    if (!amount || amount < 1) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const orderData = {
        amount: parseInt(amount) * 100, // Convert to paise
        paymentMethod,
        isAnonymous,
        campaignId: selectedCampaign?.id,
        comments: selectedCampaign ? `Donation to ${selectedCampaign.title}` : 'General donation'
      };

      const response = await donationAPI.createOrder(orderData);

      if (response.success) {
        // Initialize Razorpay payment
        const options = {
          key: 'rzp_test_1234567890', // Replace with actual key
          amount: response.data.amount,
          currency: 'INR',
          name: 'Impact Foundation',
          description: selectedCampaign ? `Donation to ${selectedCampaign.title}` : 'General Donation',
          order_id: response.data.id,
          handler: async function (response) {
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            const verifyResponse = await donationAPI.verifyPayment(verificationData);
            
            if (verifyResponse.success) {
              alert('Donation successful! Thank you for your generosity.');
              navigate('/dashboard');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone
          },
          theme: {
            color: '#10b981'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert(response.message || 'Failed to create donation order');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Make a Donation - Impact Foundation</title>
        <meta name="description" content="Make a secure donation to Impact Foundation and support our mission to create lasting change." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          {/* Campaign Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Choose a Campaign</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setSelectedCampaign(null)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  !selectedCampaign 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <HeartIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">General Donation</h3>
                  <p className="text-sm text-gray-600">Support our overall mission</p>
                </div>
              </button>

              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedCampaign?.id === campaign.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <img 
                      src={campaign.image} 
                      alt={campaign.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold mb-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{(campaign.raised / 100000).toFixed(1)}L raised of ₹{(campaign.target / 100000).toFixed(1)}L
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                  Make a Donation
                </h1>
                <p className="text-lg text-gray-600">
                  {selectedCampaign 
                    ? `Support: ${selectedCampaign.title}`
                    : 'Your generous contribution helps us create lasting change in communities.'
                  }
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-medium p-8">
                {/* User Info */}
                {user && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Donor Information</h3>
                    <p className="text-gray-600">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">{user.phone}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.kycStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        KYC: {user.kycStatus || 'Not Submitted'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Fraud Warning */}
                {fraudWarning && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {fraudWarning.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Amount (₹)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountChange(preset)}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                          amount === preset
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'upi', label: 'UPI (Google Pay/PhonePe)', icon: '📱' },
                      { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                      { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
                      { value: 'wallet', label: 'Wallet (Paytm/PhonePe)', icon: '👛' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Anonymous Donation */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Make this donation anonymous
                    </span>
                  </label>
                </div>

                {/* Security Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔒 Secure Payment</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 256-bit SSL encryption</li>
                    <li>• PCI DSS compliant</li>
                    <li>• 80G tax benefit available</li>
                    <li>• 7-day verification period</li>
                    <li>• Advanced fraud detection</li>
                  </ul>
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonate}
                  disabled={!amount || amount < 1 || loading}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <HeartIcon className="h-5 w-5" />
                      <span>Donate ₹{amount || '0'}</span>
                    </>
                  )}
                </button>

                {/* Terms */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                  By donating, you agree to our Terms of Service and Privacy Policy.
                  All donations are final and non-refundable after 7-day verification period.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationPage;
