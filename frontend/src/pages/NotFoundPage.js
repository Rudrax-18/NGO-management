import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Impact Foundation</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block btn-primary px-8 py-3 text-lg font-medium"
            >
              Go Back Home
            </Link>
            
            <div className="text-sm text-gray-500">
              Or contact us at{' '}
              <a href="mailto:support@impactfoundation.org" className="text-primary-600 hover:underline">
                support@impactfoundation.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
