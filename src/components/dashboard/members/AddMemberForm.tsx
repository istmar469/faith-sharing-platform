
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from 'lucide-react';

const memberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "editor", "member"], {
    required_error: "Please select a role",
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  useTemporaryPassword: z.boolean().default(false),
});

interface AddMemberFormProps {
  organizationId: string;
  onMemberAdded: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ organizationId, onMemberAdded }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      email: "",
      role: "member",
      password: "",
      useTemporaryPassword: false,
    },
  });

  const useTemporaryPassword = form.watch("useTemporaryPassword");

  const onSubmit = async (values: z.infer<typeof memberSchema>) => {
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
      let userId;
      
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create a new one if using temp password
        if (values.useTemporaryPassword && values.password) {
          const { data: newUser, error: signUpError } = await supabase.auth.signUp({
            email: values.email,
            password: values.password!,
            options: {
              data: {
                organization_id: organizationId,
                role: values.role
              }
            }
          });

          if (signUpError) throw signUpError;
          userId = newUser.user?.id;
          
          toast({
            title: "User Created",
            description: `New user created with email: ${values.email}`,
          });
        } else {
          // Not using temp password, but user doesn't exist
          toast({
            title: "User Not Found",
            description: "This user doesn't exist. Please either create them with a temporary password or have them sign up first.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } else if (userError) {
        throw userError;
      } else {
        // User exists
        userId = existingUser.id;
      }

      if (userId) {
        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('user_id', userId)
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
              user_id: userId,
              role: values.role,
            });

          if (insertError) throw insertError;

          toast({
            title: "Member Added",
            description: `${values.email} has been added as ${values.role}`,
          });
        }

        form.reset();
        onMemberAdded();
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Member</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
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
              </div>

              <FormField
                control={form.control}
                name="useTemporaryPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Create user with temporary password</FormLabel>
                  </FormItem>
                )}
              />

              {useTemporaryPassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Minimum 6 characters" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
        </div>
      </CardContent>
    </Card>
  );
};

export default AddMemberForm;
