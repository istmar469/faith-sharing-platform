
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface FloatingAdminButtonProps {
  onShowAdminBar: () => void;
}

const FloatingAdminButton: React.FC<FloatingAdminButtonProps> = ({ onShowAdminBar }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={onShowAdminBar}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        title="Show Admin Controls (Ctrl+Shift+A)"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FloatingAdminButton;
