
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
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const organizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  subdomain: z.string().optional(),
  description: z.string().optional(),
  // New fields
  pastorName: z.string().min(2, { message: "Pastor name must be at least 2 characters" }),
  phoneNumber: z.string()
    .regex(/^\+?[0-9()-\s]+$/, { message: "Please enter a valid phone number" })
    .optional()
    .or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email address" }),
  contactRole: z.enum(["pastor", "admin", "staff"], { 
    required_error: "Please select your role" 
  }),
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
      pastorName: "",
      phoneNumber: "",
      email: "",
      contactRole: "admin",
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
          pastor_name: values.pastorName,
          phone_number: values.phoneNumber || null,
          contact_email: values.email,
          contact_role: values.contactRole,
          // Additional fields that would be needed for automated setup
          website_enabled: true,
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

  // Helper function to generate a slug from the org name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // When name changes, suggest a slug
  React.useEffect(() => {
    const name = form.watch('name');
    if (name && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(name));
    }
    // Also suggest a subdomain based on the slug
    if (name && !form.getValues('subdomain')) {
      const slug = generateSlug(name);
      form.setValue('subdomain', slug);
    }
  }, [form.watch('name')]);

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
            {/* Organization Basic Details Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">Organization Details</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Example Church" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, recognizable name for the organization
                    </FormDescription>
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
                    <FormDescription>
                      This creates a unique URL path for the organization. Use lowercase letters, numbers, and hyphens only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormControl>
                      <Input placeholder="example" {...field} />
                    </FormControl>
                    <FormDescription>
                      If provided, creates a custom subdomain for accessing the organization's pages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="pastorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pastor's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.org" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pastor">I am the Pastor</SelectItem>
                        <SelectItem value="admin">I am an Administrator</SelectItem>
                        <SelectItem value="staff">I am a Staff Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indicate your role at the organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
