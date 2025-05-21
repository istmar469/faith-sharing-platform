
import React, { useState } from 'react';
import SideNav from '../dashboard/SideNav';
import PageHeader from './PageHeader';
import PageCanvas from './PageCanvas';
import SidebarContainer from './sidebar/SidebarContainer';

const PageBuilder = () => {
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  
  // Mock page elements for demo
  const pageElements = [
    { type: 'header', component: 'Hero Section' },
    { type: 'text', component: 'Text Block' },
    { type: 'image', component: 'Image Gallery' }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      
      <div className="flex-1 flex flex-col">
        <PageHeader 
          pageTitle={pageTitle}
          setPageTitle={setPageTitle}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <PageCanvas pageElements={pageElements} />
          <SidebarContainer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
