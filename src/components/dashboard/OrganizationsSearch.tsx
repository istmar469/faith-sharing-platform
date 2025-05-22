
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrganizationsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const OrganizationsSearch: React.FC<OrganizationsSearchProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button onClick={onRefresh}>
        Refresh
      </Button>
      <Button variant="outline" onClick={() => navigate('/diagnostic')}>
        Diagnostics
      </Button>
    </div>
  );
};

export default OrganizationsSearch;
