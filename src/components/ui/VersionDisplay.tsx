import React from 'react';
import { BUILD_INFO } from '@/generated/buildInfo';

interface VersionDisplayProps {
  position?: 'fixed' | 'static';
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  position = 'fixed',
  className = '' 
}) => {
  const baseClasses = "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono";
  const positionClasses = position === 'fixed' 
    ? "fixed bottom-2 right-2 z-50" 
    : "";

  return (
    <div className={`${baseClasses} ${positionClasses} ${className}`}>
      v{BUILD_INFO.version} • {BUILD_INFO.gitCommitShort}
    </div>
  );
};

export default VersionDisplay; 