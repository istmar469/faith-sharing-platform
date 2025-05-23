
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  errorDetails?: string | null;
  debugInfo?: any;
  onDiagnostic?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  errorDetails, 
  debugInfo,
  onDiagnostic 
}) => {
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h1 className="text-xl sm:text-2xl font-bold mb-4">{error}</h1>
      {errorDetails && <p className="text-gray-600 mb-6">{errorDetails}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button 
          className="w-full sm:w-auto"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
        
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => onDiagnostic ? onDiagnostic() : navigate('/diagnostic')}
        >
          Diagnostics
        </Button>
        
        <Button
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
      
      {showDebug && debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-left text-xs font-mono overflow-auto w-full max-w-md max-h-64">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
