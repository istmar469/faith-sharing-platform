import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, CheckCircle2, AlertCircle, ExternalLink, Settings } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SubscriptionTestPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [testOrgId, setTestOrgId] = useState('');
  const [selectedTier, setSelectedTier] = useState('standard');

  const handleTestCheckout = async (tier: string) => {
    if (!testOrgId) {
      toast({
        title: "Organization Required",
        description: "Please enter a test organization ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tier: tier,
          organizationId: testOrgId
        }
      });

      if (error) throw error;

      if (data.checkout_url) {
        // Open Stripe checkout in a new tab
        window.open(data.checkout_url, '_blank');
        setStatus('success');
        setMessage(`Stripe checkout opened for ${tier} plan. Complete the payment with test card 4242 4242 4242 4242.`);
      } else if (data.success) {
        setStatus('success');
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestBillingPortal = async () => {
    if (!testOrgId) {
      toast({
        title: "Organization Required",
        description: "Please enter a test organization ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          organizationId: testOrgId
        }
      });

      if (error) throw error;

      if (data.portal_url) {
        window.open(data.portal_url, '_blank');
        toast({
          title: "Billing Portal Opened",
          description: "Stripe billing portal opened in a new tab"
        });
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open billing portal. Organization might not have an active subscription.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscriptionTiers = [
    {
      name: 'basic',
      displayName: 'Basic Plan',
      price: 'Free',
      description: 'Perfect for small churches starting out',
      features: ['Website hosting', 'Basic templates', '5GB storage', 'Email support']
    },
    {
      name: 'standard',
      displayName: 'Standard Plan', 
      price: '$19.99/month',
      description: 'Great for growing churches',
      features: ['Everything in Basic', 'Custom domains', '50GB storage', 'Priority support', 'Advanced templates']
    },
    {
      name: 'premium',
      displayName: 'Premium Plan',
      price: '$39.99/month', 
      description: 'For large churches with advanced needs',
      features: ['Everything in Standard', 'Unlimited storage', 'Custom integrations', 'Dedicated support', 'Advanced analytics']
    }
  ];

  const testCards = [
    { number: '4242 4242 4242 4242', type: 'Visa', result: 'Successful payment' },
    { number: '4000 0000 0000 0002', type: 'Visa', result: 'Card declined' },
    { number: '4000 0000 0000 9995', type: 'Visa', result: 'Insufficient funds' },
    { number: '4000 0000 0000 9987', type: 'Visa', result: 'Lost card' },
    { number: '4000 0000 0000 0069', type: 'Visa', result: 'Expired card' },
  ];

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Stripe Subscription Testing</h1>
        <p className="text-gray-600">Test the complete subscription flow including payment methods and billing management</p>
      </div>

      <Tabs defaultValue="checkout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkout">Test Checkout</TabsTrigger>
          <TabsTrigger value="billing">Test Billing Portal</TabsTrigger>
          <TabsTrigger value="cards">Test Cards Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Organization Setup</CardTitle>
              <CardDescription>
                Enter a test organization ID to simulate subscription flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="orgId">Organization ID</Label>
                <Input
                  type="text"
                  id="orgId"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={testOrgId}
                  onChange={(e) => setTestOrgId(e.target.value)}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
                <h3 className="text-blue-800 font-medium mb-2">🧪 Test Mode Active</h3>
                <p className="text-blue-700 text-sm mb-2">
                  This is using Stripe test mode. No real charges will be made.
                </p>
                <p className="text-blue-700 text-sm">
                  Use the test cards in the "Test Cards Reference" tab for different scenarios.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {subscriptionTiers.map((tier) => (
              <Card key={tier.name} className={`relative ${tier.name === 'premium' ? 'border-purple-500 shadow-lg' : ''}`}>
                {tier.name === 'premium' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.displayName}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="text-2xl font-bold text-purple-600">{tier.price}</div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleTestCheckout(tier.name)}
                    disabled={isLoading || !testOrgId}
                    variant={tier.name === 'premium' ? 'default' : 'outline'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {tier.name === 'basic' ? 'Activate Free Plan' : 'Test Subscribe'}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {status === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Test Successful</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Billing Portal
              </CardTitle>
              <CardDescription>
                Test the Stripe Customer Portal for managing payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="billingOrgId">Organization ID (with active subscription)</Label>
                <Input
                  type="text"
                  id="billingOrgId"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={testOrgId}
                  onChange={(e) => setTestOrgId(e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                <h3 className="text-yellow-800 font-medium mb-2">⚠️ Prerequisite</h3>
                <p className="text-yellow-700 text-sm">
                  The organization must have an active subscription to access the billing portal.
                  Test the checkout flow first to create a subscription.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Customer Portal Features</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Update payment methods (add/remove credit/debit cards)</li>
                  <li>• Update billing information and address</li>
                  <li>• Download invoices and receipts</li>
                  <li>• View payment history</li>
                  <li>• Cancel subscription</li>
                  <li>• Update subscription (upgrade/downgrade)</li>
                </ul>
              </div>

              <Button
                onClick={handleTestBillingPortal}
                disabled={isLoading || !testOrgId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Billing Portal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Test Cards Reference</CardTitle>
              <CardDescription>
                Use these test cards to simulate different payment scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCards.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm">{card.number}</div>
                      <Badge variant="outline">{card.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{card.result}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Additional Test Details</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use any future expiration date (e.g., 12/34)</li>
                  <li>• Use any 3-digit CVC (e.g., 123)</li>
                  <li>• Use any valid ZIP code (e.g., 12345)</li>
                  <li>• All test payments will show "TEST" in your Stripe dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionTestPage; 