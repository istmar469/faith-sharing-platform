
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default AuthRoutes;
