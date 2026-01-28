import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdminUsers = () => {
  return (
    <>
      <Helmet>
        <title>Manage Users - Admin Dashboard</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
          <div className="bg-white rounded-xl shadow-medium p-8">
            <p>User management coming soon...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
