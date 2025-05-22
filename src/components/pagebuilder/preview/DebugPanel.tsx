
import React from 'react';

interface DebugPanelProps {
  debugInfo: any;
}

const DebugPanel = ({ debugInfo }: DebugPanelProps) => {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md w-full max-w-2xl">
      <h3 className="text-sm font-medium mb-2">Debug Information</h3>
      <pre className="text-xs font-mono bg-gray-200 p-3 rounded overflow-x-auto max-h-80">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugPanel;
