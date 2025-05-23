
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  orgData?: any;
  debugInfo?: any;
  isPreviewMode?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  orgData, 
  debugInfo,
  isPreviewMode = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${isPreviewMode ? 'bg-white p-6 rounded-lg shadow-sm' : 'text-center'}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Error
          </h1>
          
          <p className="text-gray-600 mb-6 text-center">
            {error}
          </p>
          
          {orgData && (
            <div className="text-sm text-gray-500 text-center">
              <p>Organization: {orgData.name}</p>
              {orgData.subdomain && (
                <p>Subdomain: {orgData.subdomain}</p>
              )}
            </div>
          )}
          
          {!isPreviewMode && debugInfo && import.meta.env.DEV && (
            <details className="mt-6 text-xs text-left w-full">
              <summary className="cursor-pointer text-gray-500">Debug Info</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
