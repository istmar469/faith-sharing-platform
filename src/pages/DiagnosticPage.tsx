
import React from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <header className="container mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-2">Church-OS Diagnostics</h1>
        <p className="text-gray-600">
          Use these tools to diagnose and troubleshoot issues with your Church-OS installation
        </p>
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            size="sm"
          >
            Back
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto">
        <DomainDetectionTester />
      </main>
    </div>
  );
};

export default DiagnosticPage;
