
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';

type OrganizationMembersProps = {
  showComingSoonToast: () => void;
};

const OrganizationMembers: React.FC<OrganizationMembersProps> = ({ showComingSoonToast }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
        <CardDescription>Manage members of this organization</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Member management functionality coming soon
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={showComingSoonToast}>
          <Users className="h-4 w-4 mr-2" /> Add Members
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrganizationMembers;
