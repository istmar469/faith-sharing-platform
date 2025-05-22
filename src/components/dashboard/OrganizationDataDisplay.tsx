
import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { OrganizationData } from './types';
import OrganizationsTable from './OrganizationsTable';

interface OrganizationDataDisplayProps {
  loading: boolean;
  error: string | null;
  filteredOrganizations: OrganizationData[];
  onOrgClick: (orgId: string) => void;
  onRetry: () => void;
  onAuthRetry: () => Promise<void>;
}

const OrganizationDataDisplay: React.FC<OrganizationDataDisplayProps> = ({
  loading,
  error,
  filteredOrganizations,
  onOrgClick,
  onRetry,
  onAuthRetry
}) => {
  if (loading) {
    return (
      <Card className="my-6">
        <CardContent className="flex flex-col items-center justify-center h-32 p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <span className="mb-4">Loading organizations...</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="my-6 border-red-300">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Data</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end space-x-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
            <Button onClick={onAuthRetry} variant="outline" size="sm" className="ml-2">
              Refresh Auth
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <OrganizationsTable
      organizations={filteredOrganizations}
      onOrgClick={onOrgClick}
    />
  );
};

export default OrganizationDataDisplay;
