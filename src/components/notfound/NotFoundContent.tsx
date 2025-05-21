
import React from 'react';
import { Link } from "react-router-dom";
import { AlertTriangle } from 'lucide-react';
import SubdomainInfo from './SubdomainInfo';
import SubdomainChecker from './SubdomainChecker';
import TroubleshootingGuide from './TroubleshootingGuide';

interface NotFoundContentProps {
  isSubdomainError: boolean;
  isUuidSubdomain: boolean;
  subdomain: string | null;
  currentSubdomain: string;
}

const NotFoundContent = ({ 
  isSubdomainError, 
  isUuidSubdomain, 
  subdomain,
  currentSubdomain 
}: NotFoundContentProps) => {
  if (isSubdomainError) {
    return (
      <>
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isUuidSubdomain ? "Invalid Subdomain Format" : "Domain Not Configured"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isUuidSubdomain 
            ? "You seem to be using a UUID as a subdomain. Did you mean to use the preview feature instead?"
            : "The subdomain you're trying to access either doesn't exist or hasn't been properly configured."}
        </p>
        
        <SubdomainInfo currentSubdomain={currentSubdomain} />
        
        {subdomain && <SubdomainChecker subdomain={subdomain} />}
        
        <div className="space-y-4 mt-4">
          <Link 
            to="/" 
            className="block w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
        
        <TroubleshootingGuide isUuidSubdomain={isUuidSubdomain} />
      </>
    );
  }
  
  return (
    <>
      <h1 className="text-6xl font-bold text-gray-400 mb-6">404</h1>
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-y-4">
        <Link 
          to="/" 
          className="block w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </>
  );
};

export default NotFoundContent;
