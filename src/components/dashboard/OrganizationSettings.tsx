
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';

type OrganizationSettingsProps = {
  showComingSoonToast: () => void;
};

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ showComingSoonToast }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>Configure organization preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Organization settings functionality coming soon
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
          <Settings className="h-4 w-4 mr-2" /> Edit Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrganizationSettings;
