import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Users, 
  Loader2,
  ArrowRight,
  X,
  LogOut 
} from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import OrganizationCreationForm from '@/components/onboarding/OrganizationCreationForm';

interface SubscriptionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTier?: string;
}

const SubscriptionFlow: React.FC<SubscriptionFlowProps> = ({ 
  isOpen, 
  onClose, 
  preselectedTier 
}) => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { tiers, loading: tiersLoading } = useSubscriptionTiers();
  const [step, setStep] = useState<'auth' | 'organization' | 'subscription'>('auth');
  const [selectedTier, setSelectedTier] = useState<string>('basic');
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<any[]>([]);
  const [checkingOrganizations, setCheckingOrganizations] = useState(false);

  // Use preselectedTier when provided
  useEffect(() => {
    if (preselectedTier && preselectedTier !== selectedTier) {
      console.log('SubscriptionFlow: Setting preselected tier:', preselectedTier);
      setSelectedTier(preselectedTier);
    }
  }, [preselectedTier]);

  // Check for existing organizations when user changes
  useEffect(() => {
    const checkUserOrganizations = async () => {
      if (!user) {
        setUserOrganizations([]);
        return;
      }

      setCheckingOrganizations(true);
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            role,
            organizations:organization_id (
              id,
              name,
              subdomain
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const orgs = data?.map(member => ({
          id: member.organizations.id,
          name: member.organizations.name,
          subdomain: member.organizations.subdomain,
          role: member.role
        })) || [];

        console.log('SubscriptionFlow: User organizations:', orgs);
        setUserOrganizations(orgs);

        // If user has organizations, set the first one as the organization ID
        if (orgs.length > 0) {
          setOrganizationId(orgs[0].id);
        }
      } catch (error) {
        console.error('Error fetching user organizations:', error);
      } finally {
        setCheckingOrganizations(false);
      }
    };

    checkUserOrganizations();
  }, [user]);

  useEffect(() => {
    console.log('SubscriptionFlow: Dialog state changed. isOpen:', isOpen, 'user:', !!user);
    if (isOpen) {
      if (user) {
        console.log('SubscriptionFlow: User already authenticated');
        
        // Check if user already has organizations
        if (userOrganizations.length > 0) {
          console.log('SubscriptionFlow: User already has organizations, checking tier');
          
          if (selectedTier === 'basic') {
            // For basic plan, redirect to dashboard since they already have an org
            toast.success('Welcome back! Redirecting to your dashboard.');
            navigate(`/dashboard?org=${userOrganizations[0].id}`);
            onClose();
            return;
          } else {
            // For paid plans, go to subscription step
            console.log('SubscriptionFlow: Going to subscription step');
            setStep('subscription');
            return;
          }
        } else if (!checkingOrganizations) {
          // No organizations found and not currently checking, go to organization step
          console.log('SubscriptionFlow: User has no organizations, going to organization step');
          setStep('organization');
        }
      } else {
        console.log('SubscriptionFlow: No user, starting with auth step');
        setStep('auth');
      }
    } else {
      setStep('auth');
      setOrganizationId(null);
      setProcessingTier(null);
    }
  }, [isOpen, user, userOrganizations, checkingOrganizations, selectedTier, navigate, onClose]);

  const handleAuthSuccess = () => {
    console.log('SubscriptionFlow: handleAuthSuccess called, current user:', !!user);
    console.log('SubscriptionFlow: Moving to organization step');
    // The useEffect will handle the next step based on existing organizations
  };

  const handleOrganizationCreated = (orgId: string) => {
    console.log('SubscriptionFlow: Organization created:', orgId, 'Moving to subscription step');
    setOrganizationId(orgId);
    
    // Always go to subscription step so users can choose their plan
    console.log('SubscriptionFlow: Moving to subscription step for plan selection');
    setStep('subscription');
  };

  const handleSubscribe = async (tierName: string) => {
    if (!organizationId) {
      toast.error('Please create your organization first');
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
        // Open Stripe checkout in the same window
        window.location.href = data.checkout_url;
      } else if (data.success) {
        toast.success(data.message);
        navigate(`/dashboard?org=${organizationId}`);
        onClose();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('SubscriptionFlow: Logging out user');
      await signOut();
      onClose(); // Close the dialog
      navigate('/', { replace: true }); // Redirect to home page
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'basic': return <Users className="h-6 w-6" />;
      case 'standard': return <Zap className="h-6 w-6" />;
      case 'premium': return <Crown className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'basic': return 'text-blue-600';
      case 'standard': return 'text-purple-600';
      case 'premium': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'auth': return 'Create Your Account';
      case 'organization': return 'Setup Your Organization';
      case 'subscription': return `Complete Your ${selectedTier} Plan`;
      default: return 'Get Started';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'auth': return 'Create your account or sign in to continue';
      case 'organization': return 'Set up your church or organization profile';
      case 'subscription': 
        const tierData = tiers.find(t => t.name === selectedTier);
        return tierData ? `Complete your ${tierData.display_name} subscription for $${tierData.price_monthly}/month` : 'Choose your plan and enter payment details';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {getStepTitle()}
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                {getStepDescription()}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose} title="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center ${step === 'auth' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'auth' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {step === 'auth' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${
              step === 'organization' ? 'text-blue-600' : 
              step === 'subscription' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'organization' ? 'bg-blue-100 text-blue-600' : 
                step === 'subscription' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {step === 'subscription' ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Organization</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${step === 'subscription' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'subscription' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Subscription</span>
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="mt-6">
          {step === 'auth' && (
            <div className="max-w-md mx-auto">
              <AuthForm onSuccess={handleAuthSuccess} />
            </div>
          )}

          {step === 'organization' && (
            <div>
              <OrganizationCreationForm onSuccess={handleOrganizationCreated} />
            </div>
          )}

          {step === 'subscription' && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600">
                  Select the subscription that best fits your needs
                </p>
              </div>

              {tiersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <Card 
                      key={tier.id} 
                      className={`relative cursor-pointer transition-all duration-200 ${
                        selectedTier === tier.name 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-lg'
                      } ${tier.name === 'standard' ? 'border-blue-500 shadow-md' : ''}`}
                      onClick={() => setSelectedTier(tier.name)}
                    >
                      {tier.name === 'standard' && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-2">
                        <div className={`mx-auto mb-4 ${getTierColor(tier.name)}`}>
                          {getTierIcon(tier.name)}
                        </div>
                        <CardTitle className="text-xl">{tier.display_name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">
                            ${tier.price_monthly / 100}
                          </span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className="w-full"
                          onClick={() => handleSubscribe(tier.name)}
                          disabled={processingTier === tier.name}
                          variant={selectedTier === tier.name ? 'default' : 'outline'}
                        >
                          {processingTier === tier.name ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            tier.name === 'basic' ? 'Complete Setup' : 'Continue to Payment'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="text-center mt-8 text-sm text-gray-500">
                <p>All plans include a 14-day free trial. Cancel anytime.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionFlow; 