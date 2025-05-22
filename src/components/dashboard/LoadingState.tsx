
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Checking permissions..." 
}) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-primary-dark">
      <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
