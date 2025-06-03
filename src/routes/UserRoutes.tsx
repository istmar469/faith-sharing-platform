
import React from 'react';
import { Route } from 'react-router-dom';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import BillingPage from '@/pages/BillingPage';
import ImpersonatePage from '@/pages/ImpersonatePage';

const UserRoutes: React.FC = () => (
  <>
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/billing" element={<BillingPage />} />
    <Route path="/impersonate/:userId" element={<ImpersonatePage />} />
  </>
);

export default UserRoutes;
