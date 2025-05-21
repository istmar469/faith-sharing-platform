
import React from 'react';
import SideNav from '../dashboard/SideNav';
import PageHeader from './PageHeader';
import PageCanvas from './PageCanvas';
import SidebarContainer from './sidebar/SidebarContainer';
import { PageBuilderProvider } from './context/PageBuilderContext';

const PageBuilder = () => {
  return (
    <PageBuilderProvider>
      <div className="flex h-screen bg-gray-100">
        <SideNav />
        
        <div className="flex-1 flex flex-col">
          <PageHeader />
          
          <div className="flex-1 flex overflow-hidden">
            <PageCanvas />
            <SidebarContainer />
          </div>
        </div>
      </div>
    </PageBuilderProvider>
  );
};

export default PageBuilder;
