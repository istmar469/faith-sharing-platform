
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import AddMemberForm from './members/AddMemberForm';
import MembersList from './members/MembersList';
import { useMemberManagement } from './members/useMemberManagement';
import { MemberManagementProps } from './members/types';

const OrganizationMembers: React.FC<MemberManagementProps> = ({ showComingSoonToast }) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  
  const { 
    members, 
    isLoading, 
    error, 
    fetchMembers,
    handleRetry 
  } = useMemberManagement(organizationId);

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
        <MembersList 
          members={members}
          isLoading={isLoading}
          organizationId={organizationId}
          onMemberRemoved={fetchMembers}
        />
      )}
    </div>
  );
};

export default OrganizationMembers;
