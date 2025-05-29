import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

const TestUserCreatorPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('checking...');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationId: '',
    role: 'admin'
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchOrgs();
  }, []);

  const checkAuthAndFetchOrgs = async () => {
    try {
      // Check authentication status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        setAuthStatus('Error checking auth');
        return;
      }

      if (!session) {
        setAuthStatus('Not authenticated');
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        return;
      }

      setAuthStatus(`Authenticated as: ${session.user.email}`);
      await fetchOrganizations();
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthStatus('Error');
    }
  };

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      console.log('TestUserCreator: Fetching organizations...');
      
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain')
        .order('name');

      console.log('TestUserCreator: Organizations response:', { data, error });

      if (error) throw error;
      
      console.log('TestUserCreator: Organizations loaded:', data?.length || 0);
      setOrganizations(data || []);
    } catch (error) {
      console.error('TestUserCreator: Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations. Please make sure you're logged in and have access.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const createTestUser = async () => {
    if (!formData.email || !formData.password || !formData.organizationId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    console.log('=== Starting User Creation Process ===');
    console.log('FormData:', formData);

    setIsLoading(true);
    try {
      console.log('Step 1: Creating user account with Supabase auth...');
      
      // Step 1: Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('already registered')) {
          console.log('User already exists, showing appropriate message');
          toast({
            title: "User Already Exists",
            description: "This email is already registered. You can add them to an organization if they're not already a member.",
            variant: "destructive",
          });
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from auth signup');
        throw new Error('User creation failed - no user data returned');
      }

      console.log('Step 2: User created successfully, ID:', authData.user.id);
      console.log('Step 3: Adding user to organization...');

      // Step 2: Add user to organization with specified role
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: formData.organizationId,
          user_id: authData.user.id,
          role: formData.role,
        });

      console.log('Organization membership result:', { memberError });

      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        // User was created but couldn't be added to org - that's okay, they can be added later
        toast({
          title: "User Created (Partial Success)",
          description: `User ${formData.email} was created but couldn't be automatically added to the organization. You can add them manually from the organization settings.`,
          variant: "default",
        });
      } else {
        console.log('Step 4: User successfully added to organization');
        const orgName = organizations.find(org => org.id === formData.organizationId)?.name;
        console.log('Showing success toast for org:', orgName);
        
        toast({
          title: "Success!",
          description: `Test user ${formData.email} created and added as ${formData.role} to ${orgName}`,
        });
      }

      console.log('Step 5: Resetting form');
      // Reset form
      setFormData({
        email: '',
        password: '',
        organizationId: '',
        role: 'admin'
      });

      console.log('=== User Creation Process Complete ===');

    } catch (error) {
      console.error('=== User Creation Process Failed ===');
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomUser = () => {
    const timestamp = Date.now();
    setFormData({
      ...formData,
      email: `testuser${timestamp}@example.com`,
      password: 'TestPass123!'
    });
  };

  const checkExistingUsers = async () => {
    try {
      console.log('=== Checking Existing Users ===');
      
      // Check auth.users table (this might not work due to RLS)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      console.log('Auth users:', { authUsers, authError });
      
      // Check organization_members table
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          *,
          organizations(name, subdomain)
        `);
      
      console.log('Organization members:', { members, membersError });
      
      toast({
        title: "Check Console",
        description: "User data logged to console. Check browser dev tools.",
      });
      
    } catch (error) {
      console.error('Error checking users:', error);
      toast({
        title: "Error",
        description: "Failed to check existing users",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test User Creator</h1>
          <p className="text-gray-600">
            Create test users and assign them to organizations for testing different user roles and permissions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Test User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomUser}
                    className="whitespace-nowrap"
                  >
                    Generate Random
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                  disabled={isLoadingOrgs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOrgs ? "Loading organizations..." : "Select organization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOrgs ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </div>
                      </SelectItem>
                    ) : organizations.length === 0 ? (
                      <SelectItem value="no-orgs" disabled>
                        No organizations found
                      </SelectItem>
                    ) : (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.subdomain})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="space-y-3">
                <Button
                  onClick={createTestUser}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Test User
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={checkExistingUsers}
                  variant="outline"
                  className="w-full"
                >
                  Check Existing Users (Debug)
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Testing Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Create a test user with "Admin" role for one of your organizations</li>
                <li>Sign out from your current super admin account</li>
                <li>Sign in with the test user credentials</li>
                <li>You should see only the organizations this user has access to</li>
                <li>Test the organization admin features without super admin privileges</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Auth Status:</strong> {authStatus}</p>
                <p><strong>Organizations Found:</strong> {organizations.length}</p>
                <p><strong>Loading Organizations:</strong> {isLoadingOrgs ? 'Yes' : 'No'}</p>
              </div>
              {organizations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Available organizations:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    {organizations.map(org => (
                      <li key={org.id}>{org.name} ({org.subdomain})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestUserCreatorPage; 