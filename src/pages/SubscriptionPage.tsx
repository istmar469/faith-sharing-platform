
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Crown, Zap, Users } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  const { tiers, loading, error } = useSubscriptionTiers();
  const { organizationId } = useTenantContext();
  const { toast } = useToast();
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierName: string) => {
    if (!organizationId) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive'
      });
      return;
    }

    setProcessingTier(tierName);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tier: tierName,
          organizationId: organizationId
        }
      });

      if (error) throw error;

      if (data.checkout_url) {
        // Open Stripe checkout in a new tab
        window.open(data.checkout_url, '_blank');
      } else if (data.success) {
        toast({
          title: 'Success',
          description: data.message
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start subscription process',
        variant: 'destructive'
      });
    } finally {
      setProcessingTier(null);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'basic': return <Users className="h-6 w-6" />;
      case 'premium': return <Zap className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'basic': return 'text-blue-600';
      case 'premium': return 'text-purple-600';
      case 'enterprise': return 'text-gold-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading subscription tiers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">Error loading tiers: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Subscription Plan</h1>
        <p className="text-gray-600">Select the plan that best fits your organization's needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.id} className={`relative ${tier.name === 'premium' ? 'border-purple-500 shadow-lg' : ''}`}>
            {tier.name === 'premium' && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-purple-500 text-white">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-4 ${getTierColor(tier.name)}`}>
                {getTierIcon(tier.name)}
              </div>
              <CardTitle className="text-2xl">{tier.display_name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  ${tier.price_monthly / 100}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => handleSubscribe(tier.name)}
                disabled={processingTier === tier.name}
                variant={tier.name === 'premium' ? 'default' : 'outline'}
              >
                {processingTier === tier.name ? 'Processing...' : 
                 tier.name === 'basic' ? 'Get Started Free' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
