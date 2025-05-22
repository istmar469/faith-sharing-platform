
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DnsConfigurationGuide from './DnsConfigurationGuide';
import SubdomainTester from './domain/SubdomainTester';
import DnsConfigAlert from './domain/DnsConfigAlert';
import SubdomainInfo from './domain/SubdomainInfo';
import DomainActionButtons from './domain/DomainActionButtons';

const CustomDomainSettings = () => {
  const [showDnsGuide, setShowDnsGuide] = useState(true);
  
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
          <CardContent className="space-y-6">
            {showDnsGuide && <DnsConfigurationGuide />}
            
            <SubdomainInfo />
            <SubdomainTester />
            <DnsConfigAlert />
            <DomainActionButtons />
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomDomainSettings;
