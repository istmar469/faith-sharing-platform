
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw } from 'lucide-react';

const DomainActionButtons: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        variant="outline"
        className="gap-2"
        asChild
      >
        <Link to="/dashboard">
          <Globe className="h-4 w-4" />
          Manage Organizations
        </Link>
      </Button>
      <Button 
        variant="secondary" 
        className="gap-2" 
        asChild
      >
        <Link to="/diagnostic">
          <RefreshCw className="h-4 w-4" />
          Domain Diagnostics
        </Link>
      </Button>
    </div>
  );
};

export default DomainActionButtons;
