import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  IdentificationIcon, 
  HomeIcon, 
  CameraIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const schema = yup.object().shape({
  fullName: yup.string().min(2, 'Full name must be at least 2 characters').required('Full name is required'),
  panNumber: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number').required('PAN number is required'),
  aadhaarLast4: yup.string().matches(/^\d{4}$/, 'Please enter last 4 digits of Aadhaar').required('Aadhaar last 4 digits required'),
  address: yup.string().min(10, 'Address must be at least 10 characters').required('Address is required'),
  city: yup.string().min(2, 'City must be at least 2 characters').required('City is required'),
  state: yup.string().min(2, 'State must be at least 2 characters').required('State is required'),
  pincode: yup.string().matches(/^\d{6}$/, 'Please enter a valid 6-digit pincode').required('Pincode is required'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions').required()
});

const KYCPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // TODO: Implement KYC submission API call
      console.log('KYC Data:', data);
      alert('KYC submitted successfully! Verification will take 2-3 business days.');
    } catch (error) {
      console.error('KYC submission failed:', error);
      alert('KYC submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>KYC Verification - Impact Foundation</title>
        <meta name="description" content="Complete your KYC verification to enable secure donations and access all features." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 gradient-text">KYC Verification</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete your identity verification to enable secure donations and unlock all platform features.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    KYC verification is required for donations above ₹10,000. The verification process typically takes 2-3 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-medium p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('fullName')}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.fullName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number *
                      </label>
                      <input
                        {...register('panNumber')}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase ${
                          errors.panNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      {errors.panNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Last 4 Digits *
                      </label>
                      <input
                        {...register('aadhaarLast4')}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.aadhaarLast4 ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1234"
                        maxLength={4}
                      />
                      {errors.aadhaarLast4 && (
                        <p className="mt-1 text-sm text-red-600">{errors.aadhaarLast4.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Address Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <HomeIcon className="h-6 w-6 text-primary-600" />
                    <h2 className="text-xl font-semibold">Address Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        {...register('address')}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your complete residential address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          {...register('city')}
                          type="text"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Jamnagar"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          {...register('state')}
                          type="text"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.state ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Gujarat"
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          {...register('pincode')}
                          type="text"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.pincode ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="361001"
                          maxLength={6}
                        />
                        {errors.pincode && (
                          <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Document Upload */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <IdentificationIcon className="h-6 w-6 text-primary-600" />
                    <h2 className="text-xl font-semibold">Document Upload</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                        {photoPreview ? (
                          <div className="space-y-4">
                            <img src={photoPreview} alt="Profile Preview" className="w-32 h-32 rounded-full mx-auto object-cover" />
                            <label className="btn-primary px-4 py-2 cursor-pointer">
                              Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload profile photo</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Document (PAN/Aadhaar) *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                        {documentPreview ? (
                          <div className="space-y-4">
                            <img src={documentPreview} alt="Document Preview" className="w-32 h-32 mx-auto object-cover rounded" />
                            <label className="btn-primary px-4 py-2 cursor-pointer">
                              Change Document
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleDocumentUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <IdentificationIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload ID document</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 5MB</p>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleDocumentUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Terms and Conditions */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        {...register('termsAccepted')}
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <label className="text-sm text-gray-700 cursor-pointer">
                          I hereby declare that all information provided is accurate and authentic. 
                          I authorize Impact Foundation to verify my identity and use this information 
                          for compliance purposes. I understand that providing false information may 
                          result in legal consequences.
                        </label>
                        {errors.termsAccepted && (
                          <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex justify-center"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50 flex items-center space-x-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{loading ? 'Submitting...' : 'Submit KYC Verification'}</span>
                    {loading && <LoadingSpinner />}
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default KYCPage;
