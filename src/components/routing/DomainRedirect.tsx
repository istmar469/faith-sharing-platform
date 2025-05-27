
import React from 'react';
import { Navigate } from 'react-router-dom';

const DomainRedirect: React.FC = () => {
  // Simple redirect logic - can be enhanced later
  return <Navigate to="/page-builder" replace />;
};

export default DomainRedirect;
