
import React from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';

interface SubscriptionPlansProps {
  onSelectPlan: (tierName: string, isYearly: boolean) => void;
  selectedPlan?: string;
  isYearly?: boolean;
  onToggleBilling?: (yearly: boolean) => void;
  showToggle?: boolean;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  selectedPlan,
  isYearly = false,
  onToggleBilling,
  showToggle = true
}) => {
  const { tiers, loading, error } = useSubscriptionTiers();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load subscription plans. Please try again.</p>
      </div>
    );
  }

  const formatPrice = (monthly: number, yearly: number) => {
    if (monthly === 0) return 'Free';
    const price = isYearly ? yearly / 12 : monthly;
    return `$${(price / 100).toFixed(0)}`;
  };

  const getYearlySavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return Math.round((savings / monthlyCost) * 100);
  };

  return (
    <div className="space-y-8">
      {showToggle && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onToggleBilling?.(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => onToggleBilling?.(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Save up to 17%
              </Badge>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isPopular = tier.name === 'pro';
          const savings = getYearlySavings(tier.price_monthly, tier.price_yearly);
          
          return (
            <Card 
              key={tier.id} 
              className={`relative ${
                selectedPlan === tier.name ? 'ring-2 ring-blue-500' : ''
              } ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.display_name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(tier.price_monthly, tier.price_yearly)}
                    {tier.price_monthly > 0 && (
                      <span className="text-lg font-normal text-gray-600">
                        /{isYearly ? 'mo' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {isYearly && tier.price_monthly > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Billed annually (${(tier.price_yearly / 100).toFixed(0)}/year)
                      {savings > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Save {savings}%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button
                  onClick={() => onSelectPlan(tier.name, isYearly)}
                  className={`w-full ${
                    isPopular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : selectedPlan === tier.name
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                  }`}
                  variant={isPopular || selectedPlan === tier.name ? 'default' : 'outline'}
                >
                  {selectedPlan === tier.name ? 'Selected' : 'Get Started'}
                </Button>
                
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
