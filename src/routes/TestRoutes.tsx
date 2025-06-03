
import React from 'react';
import { Route } from 'react-router-dom';
import TestOrganizationCheck from '@/components/test/TestOrganizationCheck';
import TestUserCreatorPage from '@/pages/TestUserCreatorPage';
import SubscriptionTestPage from '@/pages/SubscriptionTestPage';

const TestRoutes: React.FC = () => (
  <>
    <Route path="/test/subscription" element={<SubscriptionTestPage />} />
    <Route path="/test/organization-check" element={<TestOrganizationCheck />} />
    <Route path="/test/user-creator" element={<TestUserCreatorPage />} />
  </>
);

export default TestRoutes;
