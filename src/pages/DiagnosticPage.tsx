
import React from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';

const DiagnosticPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Domain Diagnostic Tools</h1>
      <DomainDetectionTester />
    </div>
  );
};

export default DiagnosticPage;
