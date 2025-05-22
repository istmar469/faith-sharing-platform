
import React, { useState } from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Layers, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiagnosticPage = () => {
  const [activeTab, setActiveTab] = useState('domain');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Diagnostic Tools</h1>
        <Link to="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Errors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="domain">
          <DomainDetectionTester />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>DNS Configuration Guide</CardTitle>
              <CardDescription>
                How to properly set up your DNS for subdomain routing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Option 1: Direct Subdomain Method</h3>
                <p>Set up your CNAME record to point directly to church-os.com:</p>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  * CNAME church-os.com
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Option 2: Nested Subdomain Method (Current Config)</h3>
                <p>Set up your CNAME record to point to churches.church-os.com:</p>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  * CNAME churches.church-os.com
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Our system is now configured to support both DNS configurations. 
                  If you're experiencing subdomain routing issues, please run the diagnostic tool and check 
                  the organization's website_enabled setting.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Diagnostic</CardTitle>
              <CardDescription>
                Check authentication and session status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Authentication diagnostic tool coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Connection Diagnostic</CardTitle>
              <CardDescription>
                Test database connectivity and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Database diagnostic tool coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Log Viewer</CardTitle>
              <CardDescription>
                Review recent system errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Error log viewer coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticPage;
