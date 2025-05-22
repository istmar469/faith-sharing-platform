
import React from 'react';
import { Loader2, RefreshCw, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
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
    const isAuthError = error.toLowerCase().includes('auth') || 
                        error.toLowerCase().includes('permission') || 
                        error.toLowerCase().includes('access');

    return (
      <Card className="my-6 border-red-300">
        <CardHeader>
          <div className="flex items-center">
            {isAuthError ? (
              <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <CardTitle className="text-red-700">Error Loading Data</CardTitle>
          </div>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {isAuthError 
              ? "This appears to be an authentication or super admin permission issue. Your account may not have super admin privileges in the users table. Try signing out and signing back in with a super admin account."
              : "There was a problem fetching the organization data. Please try again."}
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="default" 
              size="sm" 
              className="ml-2"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 border-t pt-3">
          Time: {new Date().toLocaleTimeString()} | Route: {window.location.pathname}
        </CardFooter>
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
