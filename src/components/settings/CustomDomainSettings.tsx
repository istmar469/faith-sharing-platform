
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Globe } from 'lucide-react';

const CustomDomainSettings = () => {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Domain Settings</CardTitle>
            <CardDescription>
              Configure custom domains for your organization's website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You can set up custom domains in your organization settings.
              Each organization can have its own subdomain and optional custom domain.
            </p>
            <p className="mb-6">
              For full documentation on how to set up custom domains,
              please refer to our documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline"
                className="gap-2"
                asChild
              >
                <Link to="/dashboard">
                  <Globe className="h-4 w-4" />
                  Manage Organizations
                </Link>
              </Button>
              <Button 
                className="gap-2" 
                asChild
              >
                <Link to="/settings/subscription-test">
                  <CreditCard className="h-4 w-4" />
                  Test Subscription Flow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomDomainSettings;
