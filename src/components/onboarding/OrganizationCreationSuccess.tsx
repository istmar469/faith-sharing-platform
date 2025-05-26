
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { getCurrentDomain } from '@/utils/domain';

interface OrganizationCreationSuccessProps {
  organizationId: string;
  subdomain: string;
  onTestNavigation: () => void;
}

const OrganizationCreationSuccess: React.FC<OrganizationCreationSuccessProps> = ({
  organizationId,
  subdomain,
  onTestNavigation
}) => {
  const currentDomain = getCurrentDomain();
  const subdomainUrl = `https://${subdomain}.${currentDomain}`;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVisitSubdomain = () => {
    window.open(subdomainUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <CardTitle className="text-2xl text-green-700">
          Organization Created Successfully!
        </CardTitle>
        <p className="text-gray-600">
          Your organization has been set up and is ready to use.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            <strong>Organization ID:</strong> {organizationId}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Your Subdomain</h3>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-blue-600 font-mono">{subdomainUrl}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(subdomainUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleVisitSubdomain}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Your Site
            </Button>
            <Button
              variant="outline"
              onClick={onTestNavigation}
              className="w-full"
            >
              Test Navigation
            </Button>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-800">What's been set up for you:</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Organization record created with admin access
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Default site settings configured
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Homepage created and published
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Subdomain activated and ready
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Super administrators have been notified
            </li>
          </ul>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Next Steps:</strong> Visit your subdomain to access the dashboard, 
            customize your site using the page builder, and configure your organization settings.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default OrganizationCreationSuccess;
