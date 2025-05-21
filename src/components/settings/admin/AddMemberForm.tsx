
import React from 'react';
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
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { roleSchema, RoleFormValues, AdminComponentProps } from "./types";

interface AddMemberFormProps extends AdminComponentProps {
  onMemberAdded: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ 
  organizationId, 
  onMemberAdded 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (values: RoleFormValues) => {
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
      onMemberAdded();
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

  return (
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
  );
};

export default AddMemberForm;
