
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizationId } from "@/components/pagebuilder/context/useOrganizationId";
import AddMemberForm from './admin/AddMemberForm';
import MembersTable from './admin/MembersTable';
import { useOrgMembers } from './admin/useOrgMembers';
import { AdminComponentProps } from './admin/types';

const AdminManagement = ({ organizationId: propOrgId }: AdminComponentProps) => {
  const { organizationId: contextOrgId } = useOrganizationId();
  const organizationId = propOrgId || contextOrgId;
  
  const { members, isLoading, fetchMembers } = useOrgMembers(organizationId);

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

      <MembersTable 
        members={members}
        isLoading={isLoading}
        organizationId={organizationId}
        onMemberRemoved={fetchMembers}
      />
    </div>
  );
};

export default AdminManagement;
