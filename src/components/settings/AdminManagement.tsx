
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
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
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationId } from "@/components/pagebuilder/context/useOrganizationId";
import { Loader2, Trash2, UserPlus } from "lucide-react";

const roleSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "editor", "member"], {
    required_error: "Please select a role",
  }),
});

type OrgMember = {
  id: string;
  email: string;
  role: string;
  user_id: string;
};

const AdminManagement = () => {
  const { organizationId } = useOrganizationId();
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  // Fetch organization members
  const fetchMembers = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          user_id,
          users!inner(email)
        `)
        .eq('organization_id', organizationId);
        
      if (error) throw error;
      
      const formattedMembers = users.map((member: any) => ({
        id: member.id,
        email: member.users.email,
        role: member.role,
        user_id: member.user_id,
      }));
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  const onSubmit = async (values: z.infer<typeof roleSchema>) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if user exists
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

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        // Update existing membership
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
        // Add new member
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: organizationId,
            user_id: userData.id,
            role: values.role,
          });

        if (insertError) throw insertError;

        toast({
          title: "Member Added",
          description: `${values.email} has been added as ${values.role}`,
        });
      }

      form.reset();
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!organizationId) return;
    
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchMembers();
      toast({
        title: "Member Removed",
        description: "The member has been removed from your organization",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>No organization selected. Please select an organization first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Organization Member</CardTitle>
          <CardDescription>
            Add new members to your organization or update their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
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
                  name="role"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[180px]">
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
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>
            Manage current members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found in this organization.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left font-medium">Email</th>
                    <th className="py-2 px-4 text-left font-medium">Role</th>
                    <th className="py-2 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{member.email}</td>
                      <td className="py-2 px-4 capitalize">{member.role}</td>
                      <td className="py-2 px-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isDeleting === member.id}
                        >
                          {isDeleting === member.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Remove</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
