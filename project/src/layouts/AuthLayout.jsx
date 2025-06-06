import React from 'react';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Vote size={48} className="text-primary-600" />
        </div>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-gray-900">
          College E-Voting System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure, transparent, and accessible voting platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
          {children}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} College E-Voting System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
