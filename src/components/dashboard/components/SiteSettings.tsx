import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteElementEditor from './SiteElementEditor';

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState('header');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Site Settings</h1>
      <p className="mb-6 text-gray-600">
        Manage your site's global header and footer. Changes saved here will be
        reflected across your entire public site once published.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="header" className="mt-4">
          <SiteElementEditor type="header" />
        </TabsContent>
        <TabsContent value="footer" className="mt-4">
          <SiteElementEditor type="footer" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettings; 