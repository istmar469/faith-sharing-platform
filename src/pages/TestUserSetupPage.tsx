
import React from 'react';
import TestUserSetup from '@/components/dev/TestUserSetup';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TestUserSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test User Setup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and manage test users for development and testing purposes.
            This helps separate testing from super admin functionality.
          </p>
        </div>

        <TestUserSetup />
      </div>
    </div>
  );
};

export default TestUserSetupPage;
