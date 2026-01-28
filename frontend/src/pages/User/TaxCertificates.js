import React from 'react';
import { Helmet } from 'react-helmet-async';

const TaxCertificates = () => {
  return (
    <>
      <Helmet>
        <title>Tax Certificates - Impact Foundation</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Tax Certificates</h1>
          <div className="bg-white rounded-xl shadow-medium p-8">
            <p>80G tax certificates coming soon...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaxCertificates;
