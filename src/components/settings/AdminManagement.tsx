
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';
import { useOrganizationId } from "@/components/pagebuilder/context/useOrganizationId";
import AddMemberForm from './admin/AddMemberForm';
import MembersTable from './admin/MembersTable';
import { useOrgMembers } from './admin/useOrgMembers';
import { AdminComponentProps } from './admin/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const AdminManagement = ({ organizationId: propOrgId }: AdminComponentProps) => {
  const { organizationId: contextOrgId } = useOrganizationId();
  const organizationId = propOrgId || contextOrgId;
  const [error, setError] = useState<string | null>(null);
  
  const { members, isLoading, fetchMembers } = useOrgMembers(organizationId);

  const handleRetry = () => {
    setError(null);
    fetchMembers();
  };

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>No organization selected. Please select an organization first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AddMemberForm 
        organizationId={organizationId}
        onMemberAdded={fetchMembers}
      />

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit mt-2" 
                  onClick={handleRetry}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <MembersTable 
          members={members}
          isLoading={isLoading}
          organizationId={organizationId}
          onMemberRemoved={fetchMembers}
        />
      )}
    </div>
  );
};

export default AdminManagement;
