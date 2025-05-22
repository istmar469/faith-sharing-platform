
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuperAdminHeaderProps {
  onSignOut: () => void;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onSignOut }) => {
  return (
    <header className="mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
