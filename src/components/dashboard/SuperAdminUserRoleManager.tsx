
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";
import { OrganizationData } from "./types";

const superAdminAssignmentSchema = z.object({
  userId: z.string().uuid({ message: "Please select a user" }),
  organizationId: z.string().uuid({ message: "Please select an organization" }),
});

interface User {
  id: string;
  email: string;
}

interface SuperAdminUserRoleManagerProps {
  organizations: OrganizationData[];
}

const SuperAdminUserRoleManager: React.FC<SuperAdminUserRoleManagerProps> = ({ organizations }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof superAdminAssignmentSchema>>({
    resolver: zodResolver(superAdminAssignmentSchema),
    defaultValues: {
      userId: "",
      organizationId: "",
    },
  });

  // Fetch all users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // Fetch users from the users table
        const { data, error } = await supabase
          .from('users')
          .select('id, email')
          .order('email');

        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof superAdminAssignmentSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Assigning super admin role:", values);
      
      // Check if the user is already a member of the organization
      const { data: existingMember, error: memberError } = await supabase
        .from('organization_members')
        .select('id, role')
        .eq('organization_id', values.organizationId)
        .eq('user_id', values.userId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking existing member:", memberError);
        throw memberError;
      }

      if (existingMember) {
        console.log("Found existing member:", existingMember);
        // Update existing role to super_admin
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ role: 'super_admin' })
          .eq('id', existingMember.id);

        if (updateError) throw updateError;

        // Find the user's email for the toast message
        const userEmail = users.find(user => user.id === values.userId)?.email || values.userId;
        const orgName = organizations.find(org => org.id === values.organizationId)?.name || 'the organization';

        toast({
          title: "Role Updated",
          description: `${userEmail}'s role has been updated to Super Admin for ${orgName}`,
        });
        
        console.log(`Updated role to super_admin for member ID ${existingMember.id}`);
      } else {
        console.log("No existing member found, creating new membership with super_admin role");
        // Add new organization member with super_admin role
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: values.organizationId,
            user_id: values.userId,
            role: 'super_admin',
          });

        if (insertError) throw insertError;

        // Find the user's email for the toast message
        const userEmail = users.find(user => user.id === values.userId)?.email || values.userId;
        const orgName = organizations.find(org => org.id === values.organizationId)?.name || 'the organization';

        toast({
          title: "Super Admin Assigned",
          description: `${userEmail} has been added as Super Admin to ${orgName}`,
        });
        
        console.log(`Created new membership with super_admin role for user ${values.userId} in org ${values.organizationId}`);
      }

      // Also add the user to the super_admins table
      const { data: existingSuperAdmin, error: superAdminCheckError } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', values.userId)
        .single();
        
      if (superAdminCheckError && superAdminCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking existing super admin:", superAdminCheckError);
      }
      
      if (!existingSuperAdmin) {
        console.log("Adding user to super_admins table");
        const { error: superAdminInsertError } = await supabase
          .from('super_admins')
          .insert({
            user_id: values.userId
          });
          
        if (superAdminInsertError) {
          console.error("Error adding to super_admins table:", superAdminInsertError);
        } else {
          console.log("Successfully added to super_admins table");
        }
      } else {
        console.log("User already in super_admins table");
      }

      form.reset();
    } catch (error) {
      console.error('Error assigning super admin:', error);
      toast({
        title: "Error",
        description: "Failed to assign super admin role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Super Admin Role</CardTitle>
        <CardDescription>
          Grant super admin privileges to users for specific organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {isLoadingUsers ? "Loading users..." : "No users available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.length > 0 ? (
                        organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No organizations available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting || organizations.length === 0 || users.length === 0 || isLoadingUsers}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Super Admin Role
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SuperAdminUserRoleManager;
