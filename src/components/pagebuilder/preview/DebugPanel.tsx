
import React from 'react';

interface DebugPanelProps {
  debugInfo: any;
}

const DebugPanel = ({ debugInfo }: DebugPanelProps) => {
  return (
    <div className="max-w-md p-4 mt-2 bg-gray-100 border border-gray-300 rounded-md text-left overflow-auto max-h-80">
      <h4 className="text-sm font-bold mb-2">Debug Information</h4>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugPanel;
