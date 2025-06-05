
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import { useToast } from '@/hooks/use-toast';

interface SignupData {
  email: string;
  password: string;
  organizationName: string;
  subdomain: string;
  pastorName: string;
  phoneNumber: string;
}

interface SignupWithSubscriptionProps {
  onBack?: () => void;
}

const SignupWithSubscription: React.FC<SignupWithSubscriptionProps> = ({ onBack }) => {
  const [step, setStep] = useState<'plan' | 'details' | 'processing'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isYearly, setIsYearly] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    organizationName: '',
    subdomain: '',
    pastorName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = (tierName: string, yearly: boolean) => {
    setSelectedPlan(tierName);
    setIsYearly(yearly);
    setStep('details');
  };

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('check_subdomain_availability', {
        subdomain_name: subdomain
      });
      return data;
    } catch (error) {
      console.error('Error checking subdomain:', error);
      return false;
    }
  };

  const handleSubdomainChange = async (value: string) => {
    const cleanSubdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSignupData(prev => ({ ...prev, subdomain: cleanSubdomain }));
    
    if (cleanSubdomain.length >= 3) {
      const isAvailable = await checkSubdomainAvailability(cleanSubdomain);
      if (!isAvailable) {
        setError('This subdomain is already taken. Please choose another.');
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!signupData.email || !signupData.password || !signupData.organizationName || !signupData.subdomain) {
        throw new Error('Please fill in all required fields');
      }

      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (signupData.subdomain.length < 3) {
        throw new Error('Subdomain must be at least 3 characters long');
      }

      // Check subdomain availability one more time
      const isSubdomainAvailable = await checkSubdomainAvailability(signupData.subdomain);
      if (!isSubdomainAvailable) {
        throw new Error('This subdomain is already taken. Please choose another.');
      }

      setStep('processing');

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            organization_name: signupData.organizationName,
            subdomain: signupData.subdomain,
            pastor_name: signupData.pastorName,
            phone_number: signupData.phoneNumber,
            selected_tier: selectedPlan,
            billing_cycle: isYearly ? 'yearly' : 'monthly'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase.rpc('setup_new_organization', {
        org_name: signupData.organizationName,
        org_subdomain: signupData.subdomain,
        pastor_name: signupData.pastorName || null,
        contact_email: signupData.email,
        contact_role: 'admin',
        phone_number: signupData.phoneNumber || null
      });

      if (orgError) throw orgError;

      // If not free plan, initiate Stripe checkout
      if (selectedPlan !== 'basic') {
        try {
          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
            body: {
              tier: selectedPlan,
              billing_cycle: isYearly ? 'yearly' : 'monthly',
              organization_id: orgData,
              return_url: `${window.location.origin}/dashboard`,
              cancel_url: `${window.location.origin}/signup`
            }
          });

          if (checkoutError) throw checkoutError;

          if (checkoutData?.url) {
            // Redirect to Stripe checkout
            window.location.href = checkoutData.url;
            return;
          }
        } catch (stripeError) {
          console.error('Stripe checkout error:', stripeError);
          // Continue with free plan if Stripe fails
          toast({
            title: "Payment setup failed",
            description: "We've created your account with the free plan. You can upgrade later.",
            variant: "destructive"
          });
        }
      }

      // Success - redirect to dashboard or onboarding
      toast({
        title: "Account created successfully!",
        description: `Welcome to Church OS, ${signupData.organizationName}!`
      });

      // Redirect to organization dashboard
      if (signupData.subdomain) {
        window.location.href = `https://${signupData.subdomain}.church-os.com/dashboard`;
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Creating Your Account</h2>
            <p className="text-gray-600">
              Setting up your church website and dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start building your church's online presence with the perfect plan for your needs.
            </p>
          </div>

          <SubscriptionPlans
            onSelectPlan={handlePlanSelection}
            selectedPlan={selectedPlan}
            isYearly={isYearly}
            onToggleBilling={setIsYearly}
            showToggle={true}
          />

          {onBack && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('plan')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Create Your Church Account</CardTitle>
                <CardDescription>
                  Complete your registration for the {selectedPlan} plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organizationName">Church/Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={signupData.organizationName}
                  onChange={(e) => setSignupData(prev => ({ ...prev, organizationName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Choose Your Website Address *</Label>
                <div className="flex items-center">
                  <Input
                    id="subdomain"
                    value={signupData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="yourchurch"
                    required
                    minLength={3}
                  />
                  <span className="ml-2 text-gray-600">.church-os.com</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This will be your church's website address
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pastorName">Pastor/Leader Name</Label>
                  <Input
                    id="pastorName"
                    value={signupData.pastorName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, pastorName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !!error}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  `Complete Registration${selectedPlan !== 'basic' ? ' & Setup Payment' : ''}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupWithSubscription;
