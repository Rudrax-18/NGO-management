import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdminFraudReport = () => {
  return (
    <>
      <Helmet>
        <title>Fraud Report - Admin Dashboard</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Fraud Detection Report</h1>
          <div className="bg-white rounded-xl shadow-medium p-8">
            <p>Fraud detection and monitoring coming soon...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminFraudReport;
