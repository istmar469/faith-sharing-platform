import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  CreditCard, 
  Globe, 
  Trash2, 
  ExternalLink,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  subdomain: string | null;
  website_enabled: boolean;
  slug: string;
  custom_domain: string | null;
  contact_email: string | null;
  contact_role: string | null;
  pastor_name: string | null;
  phone_number: string | null;
  current_tier: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  organization_id: string;
  status: string;
  tier: string;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentHistory {
  id: string;
  organization_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  user_email: string;
}

const OrganizationManagementPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subdomain: '',
    website_enabled: false,
    custom_domain: ''
  });

  useEffect(() => {
    if (organizationId) {
      loadOrganizationData();
    }
  }, [organizationId]);

  useEffect(() => {
    // Set initial tab from URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'settings', 'subscription', 'members', 'danger'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadOrganizationData = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);

      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          description,
          subdomain,
          website_enabled,
          slug,
          custom_domain,
          contact_email,
          contact_role,
          pastor_name,
          phone_number,
          current_tier,
          created_at
        `)
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);
      
      // Set form data
      setFormData({
        name: orgData.name || '',
        description: orgData.description || '',
        subdomain: orgData.subdomain || '',
        website_enabled: orgData.website_enabled || false,
        custom_domain: orgData.custom_domain || ''
      });

      // Load subscription data
      try {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', organizationId)
          .single();
        
        setSubscription(subData);
      } catch (subError) {
        console.log('No subscription found for organization');
        setSubscription(null);
      }

      // Load payment history
      try {
        const { data: paymentData } = await supabase
          .from('payment_history')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        setPaymentHistory(paymentData || []);
      } catch (payError) {
        console.log('No payment history found');
        setPaymentHistory([]);
      }

      // Load organization members
      try {
        const { data: memberData } = await supabase
          .from('organization_members')
          .select(`
            id,
            user_id,
            role,
            created_at,
            profiles:user_id (
              email
            )
          `)
          .eq('organization_id', organizationId);

        const formattedMembers = memberData?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          created_at: member.created_at,
          user_email: (member.profiles as any)?.email || 'Unknown'
        })) || [];

        setMembers(formattedMembers);
      } catch (memberError) {
        console.log('Error loading members:', memberError);
        setMembers([]);
      }

    } catch (error) {
      console.error('Error loading organization data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organizationId || !organization) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description || null,
          subdomain: formData.subdomain || null,
          website_enabled: formData.website_enabled,
          custom_domain: formData.custom_domain || null,
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organization settings updated successfully"
      });

      // Reload organization data
      await loadOrganizationData();

    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organizationId || !organization) return;

    try {
      // Delete organization members first
      await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId);

      // Delete organization pages
      await supabase
        .from('pages')
        .delete()
        .eq('organization_id', organizationId);

      // Delete subscriptions
      await supabase
        .from('subscriptions')
        .delete()
        .eq('organization_id', organizationId);

      // Delete payment history
      await supabase
        .from('payment_history')
        .delete()
        .eq('organization_id', organizationId);

      // Finally delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organization deleted successfully"
      });

      navigate('/dashboard?admin=true');

    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          status: 'canceling',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription will be canceled at the end of the current billing period"
      });

      await loadOrganizationData();

    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };

  const handleManageBilling = async () => {
    if (!organization?.id) return;

    try {
      setSaving(true);

      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          organizationId: organization.id
        }
      });

      if (error) throw error;

      if (data.portal_url) {
        // Open Stripe customer portal in a new tab
        window.open(data.portal_url, '_blank');
      }

    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Make sure you have an active subscription.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': 
      case 'canceling': return 'bg-red-100 text-red-800';
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': 
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading organization data...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Organization Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The organization you're looking for doesn't exist or you don't have permission to access it.</p>
            <Button onClick={() => navigate('/dashboard?admin=true')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard?admin=true')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                <p className="text-gray-600">Organization Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={organization.website_enabled ? "default" : "secondary"}>
                {organization.website_enabled ? "Site Enabled" : "Site Disabled"}
              </Badge>
              {organization.subdomain && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://${organization.subdomain}.church-os.com`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Site
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total organization members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription ? subscription.tier : 'Free'}
                  </div>
                  <Badge className={getStatusColor(subscription?.status || 'free')}>
                    {subscription?.status || 'free'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Website Status</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {organization.website_enabled ? 'Active' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {organization.subdomain || 'No subdomain configured'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Organization ID</Label>
                    <p className="text-sm text-gray-600 font-mono">{organization.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-gray-600">{formatDate(organization.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Slug</Label>
                    <p className="text-sm text-gray-600">{organization.slug || 'Not configured'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage basic organization information and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                      placeholder="yourchurch"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be accessible at {formData.subdomain || 'yourchurch'}.church-os.com
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the organization"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="custom_domain">Custom Domain</Label>
                  <Input
                    id="custom_domain"
                    value={formData.custom_domain}
                    onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                    placeholder="www.yourchurch.com"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="website_enabled"
                    checked={formData.website_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, website_enabled: checked })}
                  />
                  <Label htmlFor="website_enabled">Website Enabled</Label>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveOrganization} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {subscription ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Current Subscription
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Plan</Label>
                        <p className="text-lg font-semibold capitalize">{subscription.tier}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Stripe Subscription ID</Label>
                        <p className="text-sm font-mono text-gray-600">
                          {subscription.stripe_subscription_id || 'N/A'}
                        </p>
                      </div>
                      {subscription.current_period_end && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Current Period End</Label>
                            <p className="text-sm text-gray-600">
                              {formatDate(subscription.current_period_end)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Cancel at Period End</Label>
                            <div className="flex items-center">
                              {subscription.cancel_at_period_end ? (
                                <X className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                              )}
                              <span className="text-sm">
                                {subscription.cancel_at_period_end ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline"
                          onClick={handleManageBilling}
                          disabled={saving}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {saving ? 'Opening...' : 'Manage Billing & Payment Methods'}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the subscription at the end of the current billing period. 
                                The organization will still have access until {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'the end of the period'}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction onClick={handleCancelSubscription}>
                                Cancel Subscription
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Recent payments for this organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentHistory.length > 0 ? (
                      <div className="space-y-3">
                        {paymentHistory.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(payment.created_at)}
                              </div>
                            </div>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No payment history found</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Subscription</CardTitle>
                  <CardDescription>
                    This organization is currently on the free plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This organization doesn't have an active subscription and is using the free tier.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  Users who have access to this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{member.user_email}</div>
                          <div className="text-sm text-gray-500">
                            Joined {formatDate(member.created_at)}
                          </div>
                        </div>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No members found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-medium text-red-700 mb-2">Delete Organization</h3>
                    <p className="text-sm text-red-600 mb-4">
                      This will permanently delete the organization, all its data, members, pages, and subscription information. 
                      This action cannot be undone.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Organization
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete "{organization.name}"? 
                            This will permanently remove:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>The organization and all its settings</li>
                              <li>All organization members and their access</li>
                              <li>All pages and website content</li>
                              <li>Subscription and payment history</li>
                            </ul>
                            <br />
                            <strong>This action cannot be undone.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteOrganization}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Organization
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationManagementPage; 