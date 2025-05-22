
import React, { useEffect, useState } from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Server, Globe, ArrowLeft, LayoutDashboard } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const defaultTab = searchParams.get('tab') || 'detection';
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (!error && userData) {
          setIsSuperAdmin(userData.role === 'super_admin');
        }
      } catch (err) {
        console.error("Error checking super admin status:", err);
      }
    };
    
    checkSuperAdminStatus();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <header className="container mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Church-OS Diagnostics</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              size="sm"
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {isSuperAdmin && (
              <Button 
                variant="secondary" 
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Use these tools to diagnose and troubleshoot issues with your Church-OS installation
        </p>
      </header>
      
      <main className="container mx-auto">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="detection">Domain Detection</TabsTrigger>
            <TabsTrigger value="dns-info">DNS Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detection">
            <DomainDetectionTester />
          </TabsContent>
          
          <TabsContent value="dns-info">
            <Card className="max-w-2xl mx-auto my-8">
              <CardHeader>
                <CardTitle>DNS Configuration Information</CardTitle>
                <CardDescription>
                  Understanding how Church-OS handles domain routing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <p className="font-medium">Good news!</p>
                    <p className="mt-1">Church-OS now supports <strong>both</strong> DNS configuration patterns for your domains:</p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="border rounded p-4">
                    <div className="flex gap-3">
                      <Globe className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium">Direct Configuration</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Point your CNAME record directly to <code className="bg-gray-100 px-1 py-0.5 rounded">church-os.com</code>
                        </p>
                        <div className="bg-gray-50 p-3 rounded mt-2 border">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium">Type:</div>
                            <div>CNAME</div>
                            <div className="font-medium">Name/Host:</div>
                            <div>yoursubdomain</div>
                            <div className="font-medium">Points to/Value:</div>
                            <div className="font-mono">church-os.com</div>
                            <div className="font-medium">TTL:</div>
                            <div>Auto/3600</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4">
                    <div className="flex gap-3">
                      <Server className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium">Legacy Configuration</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Point your CNAME record to <code className="bg-gray-100 px-1 py-0.5 rounded">churches.church-os.com</code> (still supported)
                        </p>
                        <div className="bg-gray-50 p-3 rounded mt-2 border">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium">Type:</div>
                            <div>CNAME</div>
                            <div className="font-medium">Name/Host:</div>
                            <div>yoursubdomain</div>
                            <div className="font-medium">Points to/Value:</div>
                            <div className="font-mono">churches.church-os.com</div>
                            <div className="font-medium">TTL:</div>
                            <div>Auto/3600</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-green-50 border border-green-100 rounded p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">How It Works</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Church-OS now has improved domain detection that works with both configuration patterns:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-green-700 space-y-2 ml-2">
                    <li>When a visitor accesses your domain, our system detects the incoming hostname</li>
                    <li>We extract the subdomain part from either <strong>subdomain.church-os.com</strong> or <strong>subdomain.churches.church-os.com</strong></li>
                    <li>The extracted subdomain is used to look up your organization in our database</li>
                    <li>If found, we serve your organization's website and content</li>
                  </ol>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Recommendation</h3>
                  <p className="text-sm text-gray-600">
                    While both configurations work, we recommend the direct configuration method 
                    (pointing to church-os.com) for simplicity and best performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DiagnosticPage;
