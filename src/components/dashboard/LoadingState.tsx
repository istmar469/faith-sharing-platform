
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message?: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading data...",
  timeout = 30000, // Increased from 10s to 30s default timeout
  onRetry
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (isTimedOut) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-primary-dark">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-amber-300" />
            <span className="ml-2 text-white font-medium text-lg">Loading Timeout</span>
          </div>
          <p className="text-white/90 mb-4">
            The request is taking longer than expected. This could be due to network issues or server load.
          </p>
          {onRetry && (
            <Button 
              variant="secondary" 
              onClick={onRetry} 
              className="w-full"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

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
