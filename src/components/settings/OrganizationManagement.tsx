
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  subdomain: z.string().optional(),
  description: z.string().optional(),
});

const OrganizationManagement = ({ onOrganizationCreated }: { onOrganizationCreated?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      subdomain: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof organizationSchema>) => {
    setIsSubmitting(true);
    try {
      // First try to get user information to make sure they're authenticated
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create an organization",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Try using RPC to create organization through a database function
      // If that doesn't exist, fall back to direct insert with proper error handling
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: values.name,
          slug: values.slug,
          subdomain: values.subdomain || null,
          description: values.description || null,
        })
        .select()
        .single();

      if (orgError) {
        // Check if RLS error
        if (orgError.code === '42501') {
          toast({
            title: "Permission Error",
            description: "You don't have permission to create organizations. Please contact an administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: orgError.message || "Failed to create organization",
            variant: "destructive",
          });
        }
        console.error('Error creating organization:', orgError);
        return;
      }

      toast({
        title: "Organization Created",
        description: `${values.name} has been created successfully`,
      });

      form.reset();
      
      if (onOrganizationCreated) {
        onOrganizationCreated();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Add a new organization to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Example Church" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="example-church" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="example" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Creating...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrganizationManagement;
