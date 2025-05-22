
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SubscriptionTestPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTestCheckout = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      // This would typically call your Stripe checkout edge function
      // For demonstration purposes, we're just showing the flow
      
      toast({
        title: "Starting checkout process",
        description: "In a real implementation, this would redirect to Stripe"
      });
      
      // Simulate a call to a Stripe checkout edge function
      // const { data, error } = await supabase.functions.invoke('create-checkout');
      // if (error) throw new Error(error.message);
      
      // Simulate successful checkout URL generation
      setTimeout(() => {
        setStatus('success');
        setMessage('Stripe checkout flow would start here. In a real implementation, you would be redirected to the Stripe checkout page.');
        setIsLoading(false);
      }, 2000);
      
      // In a real implementation, you would redirect to the checkout URL:
      // window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout process",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Test Page</CardTitle>
          <CardDescription>
            Use this page to test Stripe subscription checkout flow with test cards
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
            <h3 className="text-blue-800 font-medium mb-2">Stripe Test Mode</h3>
            <p className="text-blue-700 text-sm mb-2">
              This is a test environment. No real charges will be made.
            </p>
            <p className="text-blue-700 text-sm">
              Use Stripe test card: <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code> with any future expiration date and any CVC.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Basic Plan</h3>
              <ul className="space-y-2 text-sm mb-4">
                <li>✓ Website hosting</li>
                <li>✓ Basic templates</li>
                <li>✓ 5GB storage</li>
              </ul>
              <p className="font-bold">$9.99/month</p>
              <Button 
                onClick={handleTestCheckout} 
                disabled={isLoading} 
                className="w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Test Subscribe
                  </>
                )}
              </Button>
            </div>
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
          
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
            <h3 className="text-yellow-800 font-medium mb-2">Implementation Guide</h3>
            <p className="text-yellow-700 text-sm">
              To fully implement Stripe subscriptions, you need to:
            </p>
            <ol className="list-decimal pl-5 text-yellow-700 text-sm mt-2 space-y-1">
              <li>Create a Stripe account and get API keys</li>
              <li>Set up a Supabase edge function for creating checkout sessions</li>
              <li>Set up a Supabase edge function for verifying subscription status</li>
              <li>Set up a table to track subscriptions</li>
              <li>Update your app to handle subscription state</li>
            </ol>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionTestPage;
