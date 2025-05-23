
import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  orgName: string | null;
  orgData?: any;
  isPreviewMode?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  orgName, 
  orgData,
  isPreviewMode = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${isPreviewMode ? 'bg-white p-6 rounded-lg shadow-sm' : 'text-center'}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-blue-100 p-3 mb-4">
            <FileQuestion className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Published Homepage
          </h1>
          
          <p className="text-gray-600 mb-4 text-center">
            {orgName ? `${orgName} hasn't published a homepage yet.` : 'This organization hasn\'t published a homepage yet.'}
          </p>
          
          <p className="text-gray-500 text-sm text-center">
            Please use the Site Builder to create and publish a homepage.
          </p>
          
          {orgData && orgData.subdomain && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Organization: {orgData.name}</p>
              <p>Subdomain: {orgData.subdomain}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
