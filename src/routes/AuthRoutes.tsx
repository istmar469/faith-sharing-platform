
import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import LogoutPage from '@/pages/LogoutPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

const AuthRoutes: React.FC = () => (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/logout" element={<LogoutPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </>
);

export default AuthRoutes;
