import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import OTPLoginPage from './pages/Auth/OTPLoginPage';
import DonationPage from './pages/DonationPage';
import UserDashboard from './pages/User/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProfilePage from './pages/User/ProfilePage';
import KYCPage from './pages/User/KYCPage';
import DonationHistory from './pages/User/DonationHistory';
import TaxCertificates from './pages/User/TaxCertificates';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDonations from './pages/Admin/AdminDonations';
import AdminCampaigns from './pages/Admin/AdminCampaigns';
import AdminFraudReport from './pages/Admin/AdminFraudReport';
import NotFoundPage from './pages/NotFoundPage';

// Components
import LoadingSpinner from './components/UI/LoadingSpinner';
import ScrollToTop from './components/UI/ScrollToTop';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading Impact Foundation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Impact Foundation - NGO Donation Management System</title>
        <meta name="description" content="Join us in making a difference. 80G certified NGO with transparent donation system and secure payment gateway." />
        <meta name="keywords" content="NGO, donation, charity, 80G, tax exemption, Impact Foundation, Jamnagar" />
        <meta name="author" content="Impact Foundation" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Impact Foundation - Donate Today, Change Lives" />
        <meta property="og:description" content="Join us in making a difference. 80G certified NGO with transparent donation system." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Impact Foundation - Donate Today, Change Lives" />
        <meta name="twitter:description" content="Join us in making a difference. 80G certified NGO with transparent donation system." />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
      </Helmet>

      <ScrollToTop />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="otp-login" element={<OTPLoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="donate" element={<DonationPage />} />
            
            {/* User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="donations" element={<DonationHistory />} />
              <Route path="tax-certificates" element={<TaxCertificates />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'ngo_staff']} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/donations" element={<AdminDonations />} />
              <Route path="admin/campaigns" element={<AdminCampaigns />} />
              <Route path="admin/fraud-report" element={<AdminFraudReport />} />
            </Route>
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Redirect old routes */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
