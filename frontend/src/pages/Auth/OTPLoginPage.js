import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon,
  LockClosedIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const otpSchema = yup.object().shape({
  otp: yup.string().matches(/^\d{6}$/, 'OTP must be 6 digits').required('OTP is required'),
});

const OTPLoginPage = () => {
  const { loginWithOTP } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors }
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors }
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  // Timer for OTP resend
  React.useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, step]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onEmailSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/send-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setEmail(data.email);
        setStep('otp');
        setTimeLeft(300);
        setCanResend(false);
      } else {
        alert(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onOTPSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: data.otp,
          type: 'login'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Update auth context
        await loginWithOTP(result.data.token, result.data.user);
        
        navigate('/dashboard');
      } else {
        alert(result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      alert('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'login'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTimeLeft(300);
        setCanResend(false);
        alert('New OTP sent successfully');
      } else {
        alert(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
    setTimeLeft(300);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Secure Login
            </h2>
            <p className="text-gray-600">
              {step === 'email' ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email'}
            </p>
          </motion.div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {step === 'email' ? (
            // Email Step
            <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerEmail('email')}
                    type="email"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      emailErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {emailErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{emailErrors.email.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <LockClosedIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Secure OTP Login</p>
                    <p>We'll send a 6-digit OTP to your email for verification. No password required!</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <LoadingSpinner /> : <><span>Send OTP</span><ArrowRightIcon className="h-4 w-4" /></>}
              </button>
            </form>
          ) : (
            // OTP Step
            <form onSubmit={handleOTPSubmit(onOTPSubmit)} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Change email
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerOTP('otp')}
                    type="text"
                    maxLength={6}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest ${
                      otpErrors.otp ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                  />
                </div>
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  OTP sent to: <span className="font-medium text-gray-900">{email}</span>
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span>Expires in {formatTime(timeLeft)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <LoadingSpinner /> : <><span>Verify & Login</span><ShieldCheckIcon className="h-4 w-4" /></>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendLoading}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(timeLeft)}`}
                </button>
              </div>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Login with password
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPLoginPage;
