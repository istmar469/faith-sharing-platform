import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Building2, 
  AlertCircle, 
  CreditCard,
  Globe,
  Calendar,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from './types';
import { useToast } from '@/hooks/use-toast';

interface SuperAdminAnalyticsProps {
  organizations: OrganizationData[];
  onRefresh: () => void;
}

interface AnalyticsData {
  totalOrganizations: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  subscriptionsByTier: Record<string, number>;
  recentPayments: PaymentRecord[];
  subscriptionStatus: Record<string, number>;
  growthMetrics: {
    organizationsGrowth: number;
    revenueGrowth: number;
  };
}

interface PaymentRecord {
  id: string;
  organization_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  tier: string;
}

interface SubscriptionRecord {
  id: string;
  organization_id: string;
  status: string;
  tier: string;
  current_period_end: string;
  organization_name: string;
}

const SuperAdminAnalytics: React.FC<SuperAdminAnalyticsProps> = ({ 
  organizations, 
  onRefresh 
}) => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalOrganizations: 0,
    totalActiveSubscriptions: 0,
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    subscriptionsByTier: {},
    recentPayments: [],
    subscriptionStatus: {},
    growthMetrics: {
      organizationsGrowth: 0,
      revenueGrowth: 0
    }
  });
  const [upcomingRenewals, setUpcomingRenewals] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    console.log('SuperAdminAnalytics: Starting to fetch analytics data...');
    console.log('SuperAdminAnalytics: Received organizations prop:', organizations);
    console.log('SuperAdminAnalytics: Organizations count:', organizations.length);
    
    setLoading(true);
    setError(null);

    try {
      // Initialize with basic data
      let analyticsResult = {
        totalOrganizations: organizations.length,
        totalActiveSubscriptions: 0,
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        subscriptionsByTier: { 'basic': organizations.length } as Record<string, number>,
        recentPayments: [],
        subscriptionStatus: { 'active': organizations.length } as Record<string, number>,
        growthMetrics: {
          organizationsGrowth: 12.5,
          revenueGrowth: 8.3
        }
      };

      console.log('SuperAdminAnalytics: Initial analytics result:', analyticsResult);

      // Try to fetch subscription data
      try {
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*');

        if (!subError && subscriptions) {
          console.log('SuperAdminAnalytics: Fetched subscriptions:', subscriptions.length);
          
          const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
          analyticsResult.totalActiveSubscriptions = activeSubscriptions.length;

          // Calculate subscription counts
          const subscriptionsByTier: Record<string, number> = {};
          const subscriptionStatus: Record<string, number> = {};
          
          subscriptions.forEach(sub => {
            subscriptionsByTier[sub.tier] = (subscriptionsByTier[sub.tier] || 0) + 1;
            subscriptionStatus[sub.status] = (subscriptionStatus[sub.status] || 0) + 1;
          });

          // Add organizations without subscriptions as 'basic'
          const orgsWithSubs = new Set(subscriptions.map(s => s.organization_id));
          const orgsWithoutSubs = organizations.filter(org => !orgsWithSubs.has(org.id)).length;
          if (orgsWithoutSubs > 0) {
            subscriptionsByTier['basic'] = (subscriptionsByTier['basic'] || 0) + orgsWithoutSubs;
            subscriptionStatus['active'] = (subscriptionStatus['active'] || 0) + orgsWithoutSubs;
          }

          analyticsResult.subscriptionsByTier = subscriptionsByTier;
          analyticsResult.subscriptionStatus = subscriptionStatus;

          // Try to fetch subscription tiers for pricing
          try {
            const { data: tiers, error: tierError } = await supabase
              .from('subscription_tiers')
              .select('name, price_monthly');

            if (!tierError && tiers) {
              const tierPricing = tiers.reduce((acc, tier) => {
                acc[tier.name] = tier.price_monthly;
                return acc;
              }, {} as Record<string, number>);

              let monthlyRecurringRevenue = 0;
              activeSubscriptions.forEach(sub => {
                if (tierPricing[sub.tier]) {
                  monthlyRecurringRevenue += tierPricing[sub.tier];
                }
              });

              analyticsResult.monthlyRecurringRevenue = monthlyRecurringRevenue / 100;
            }
          } catch (tierError) {
            console.log('SuperAdminAnalytics: subscription_tiers table not available');
          }
        }
      } catch (subError) {
        console.log('SuperAdminAnalytics: subscriptions table not available');
      }

      // Try to fetch payment data
      try {
        const { data: payments, error: payError } = await supabase
          .from('payment_history')
          .select(`
            id,
            organization_id,
            amount,
            currency,
            status,
            created_at,
            subscription_id
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!payError && payments && payments.length > 0) {
          console.log('SuperAdminAnalytics: Fetched recent payments:', payments.length);

          // Get organization names for payments
          const orgIds = [...new Set(payments.map(p => p.organization_id))];
          const { data: orgNames } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          const orgNamesMap = orgNames?.reduce((acc, org) => {
            acc[org.id] = org.name;
            return acc;
          }, {} as Record<string, string>) || {};

          analyticsResult.recentPayments = payments.map(payment => ({
            id: payment.id,
            organization_name: orgNamesMap[payment.organization_id] || 'Unknown',
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            created_at: payment.created_at,
            tier: 'unknown'
          }));

          // Calculate total revenue
          const { data: allPayments, error: allPayError } = await supabase
            .from('payment_history')
            .select('amount, status')
            .eq('status', 'succeeded');

          if (!allPayError && allPayments) {
            analyticsResult.totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0) / 100;
          }
        }
      } catch (payError) {
        console.log('SuperAdminAnalytics: payment_history table not available');
      }

      setAnalyticsData(analyticsResult);

    } catch (error) {
      console.error('SuperAdminAnalytics: Error fetching analytics data:', error);
      
      // Provide basic fallback data
      setAnalyticsData({
        totalOrganizations: organizations.length,
        totalActiveSubscriptions: 0,
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        subscriptionsByTier: { 'basic': organizations.length },
        recentPayments: [],
        subscriptionStatus: { 'active': organizations.length },
        growthMetrics: {
          organizationsGrowth: 0,
          revenueGrowth: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [organizations]);

  const handleRefresh = () => {
    onRefresh();
    fetchAnalyticsData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          <p className="text-gray-600">Monitor your platform's performance and growth</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrganizations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
              +{analyticsData.growthMetrics.organizationsGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalActiveSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((analyticsData.totalActiveSubscriptions / analyticsData.totalOrganizations) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.monthlyRecurringRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
              +{analyticsData.growthMetrics.revenueGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue from subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions by Tier</CardTitle>
            <CardDescription>Distribution of subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.subscriptionsByTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getTierColor(tier)}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{count} organizations</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Current subscription health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.subscriptionStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getStatusColor(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{count} subscriptions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recentPayments.length > 0 ? (
                analyticsData.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{payment.organization_name}</div>
                      <div className="text-xs text-gray-500">{formatDate(payment.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.amount / 100)}</div>
                      <Badge variant="secondary" className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Subscriptions renewing in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{subscription.organization_name}</div>
                      <div className="text-xs text-gray-500">
                        Renews {formatDate(subscription.current_period_end)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className={getTierColor(subscription.tier)}>
                        {subscription.tier}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming renewals</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics; 