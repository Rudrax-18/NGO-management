import React from 'react';
import { Helmet } from 'react-helmet-async';

const DonationHistory = () => {
  return (
    <>
      <Helmet>
        <title>Donation History - Impact Foundation</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Donation History</h1>
          <div className="bg-white rounded-xl shadow-medium p-8">
            <p>Donation history coming soon...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationHistory;
