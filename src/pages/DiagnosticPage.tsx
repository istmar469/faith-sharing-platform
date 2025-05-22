
import React, { useState } from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Layers, Globe, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
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
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-5 w-5 text-blue-500" />
                <AlertDescription className="text-blue-700 ml-2">
                  <strong>Good news!</strong> Our application now supports both DNS configuration methods below.
                  You can use either configuration method - both will work correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-medium">Option 1: Direct Subdomain Method</h3>
                <p>Set up your CNAME record to point directly to church-os.com:</p>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  * CNAME church-os.com
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This creates URLs in the format: <span className="font-mono">yoursubdomain.church-os.com</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Option 2: Nested Subdomain Method</h3>
                <p>Set up your CNAME record to point to churches.church-os.com:</p>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  * CNAME churches.church-os.com
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This creates URLs in the format: <span className="font-mono">yoursubdomain.churches.church-os.com</span>
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="font-medium text-green-800 mb-2">Which should you use?</h4>
                <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                  <li>Both configurations are fully supported</li>
                  <li>The direct method (Option 1) is slightly simpler</li>
                  <li>If you already have DNS set up with Option 2, there's no need to change it</li>
                  <li>Our code automatically detects both configurations</li>
                </ul>
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
