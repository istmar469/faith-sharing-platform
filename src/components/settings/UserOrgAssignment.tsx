
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
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

const userAssignmentSchema = z.object({
  userId: z.string().uuid({ message: "Please select a user" }),
  organizationId: z.string().uuid({ message: "Please select an organization" }),
  role: z.enum(["admin", "editor", "member", "super_admin"], {
    required_error: "Please select a role",
  }),
});

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

const UserOrgAssignment = ({ organizations, onAssignmentComplete }: { 
  organizations: Organization[],
  onAssignmentComplete?: () => void 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof userAssignmentSchema>>({
    resolver: zodResolver(userAssignmentSchema),
    defaultValues: {
      userId: "",
      organizationId: "",
      role: "member",
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

  const onSubmit = async (values: z.infer<typeof userAssignmentSchema>) => {
    setIsSubmitting(true);
    try {
      // Check if the user is already a member of the organization
      const { data: existingMember, error: memberError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', values.organizationId)
        .eq('user_id', values.userId)
        .single();

      if (existingMember) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ role: values.role })
          .eq('id', existingMember.id);

        if (updateError) throw updateError;

        // Find the user's email for the toast message
        const userEmail = users.find(user => user.id === values.userId)?.email || values.userId;

        toast({
          title: "Role Updated",
          description: `${userEmail}'s role has been updated to ${values.role}`,
        });
      } else {
        // Add new organization member
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: values.organizationId,
            user_id: values.userId,
            role: values.role,
          });

        if (insertError) throw insertError;

        // Find the user's email for the toast message
        const userEmail = users.find(user => user.id === values.userId)?.email || values.userId;

        toast({
          title: "User Assigned",
          description: `${userEmail} has been added to the organization as ${values.role}`,
        });
      }

      form.reset();
      
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      toast({
        title: "Error",
        description: "Failed to assign user to organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign User to Organization</CardTitle>
        <CardDescription>
          Add a user to an organization or update their role
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting || organizations.length === 0 || users.length === 0 || isLoadingUsers}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign User
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserOrgAssignment;
