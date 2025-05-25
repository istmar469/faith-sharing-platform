
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useTenantContext } from '@/components/context/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, ExternalLink } from 'lucide-react';

const DonationSetupPage: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { account, loading, createConnectAccount } = useStripeConnect(organizationId || '');
  const { toast } = useToast();

  const handleSetupStripe = async () => {
    try {
      await createConnectAccount();
      toast({
        title: 'Success',
        description: 'Stripe Connect setup initiated. Please complete the setup in the new window.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup Stripe Connect',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading donation setup...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Donation Setup</h1>
        <p className="text-gray-600">Connect your Stripe account to start accepting donations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Integration
          </CardTitle>
          <CardDescription>
            Connect your organization's Stripe account to receive donations directly to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {account ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Stripe account connected successfully!</span>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Your Stripe account ID: <code>{account.stripe_account_id}</code>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  You can now accept donations through your website. All donations will go directly to your connected bank account.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Why Connect Stripe?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Accept donations directly on your website</li>
                  <li>• Funds go directly to your bank account</li>
                  <li>• Secure payment processing</li>
                  <li>• Automatic receipt generation</li>
                  <li>• Donation tracking and reporting</li>
                </ul>
              </div>
              
              <Button onClick={handleSetupStripe} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Stripe Account
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                This will open Stripe's secure setup process in a new window
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationSetupPage;
