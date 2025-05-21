
import React, { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";

const userAssignmentSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  organizationId: z.string().uuid({ message: "Please select an organization" }),
  role: z.enum(["admin", "editor", "member"], {
    required_error: "Please select a role",
  }),
});

interface Organization {
  id: string;
  name: string;
}

const UserOrgAssignment = ({ organizations, onAssignmentComplete }: { 
  organizations: Organization[],
  onAssignmentComplete?: () => void 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof userAssignmentSchema>>({
    resolver: zodResolver(userAssignmentSchema),
    defaultValues: {
      email: "",
      organizationId: "",
      role: "member",
    },
  });

  const onSubmit = async (values: z.infer<typeof userAssignmentSchema>) => {
    setIsSubmitting(true);
    try {
      // Step 1: Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: "User Not Found",
            description: "This user does not exist. They need to create an account first.",
            variant: "destructive",
          });
        } else {
          throw userError;
        }
        return;
      }

      // Step 2: Check if the user is already a member of the organization
      const { data: existingMember, error: memberError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', values.organizationId)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ role: values.role })
          .eq('id', existingMember.id);

        if (updateError) throw updateError;

        toast({
          title: "Role Updated",
          description: `${values.email}'s role has been updated to ${values.role}`,
        });
      } else {
        // Add new organization member
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: values.organizationId,
            user_id: userData.id,
            role: values.role,
          });

        if (insertError) throw insertError;

        toast({
          title: "User Assigned",
          description: `${values.email} has been added to the organization as ${values.role}`,
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
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
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || organizations.length === 0}>
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
