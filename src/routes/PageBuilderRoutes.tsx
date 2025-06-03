
import React from 'react';
import { Route } from 'react-router-dom';
import PageBuilderPage from '@/pages/PageBuilderPage';
import PreviewPage from '@/pages/PreviewPage';

const PageBuilderRoutes: React.FC = () => (
  <>
    <Route path="/page-builder" element={<PageBuilderPage />} />
    <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
    <Route path="/preview/live" element={<PreviewPage />} />
    <Route path="/preview/:pageId" element={<PreviewPage />} />
  </>
);

export default PageBuilderRoutes;
