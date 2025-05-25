
import { useState, useEffect } from 'react';

export const useIndexState = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [adminBarDismissed, setAdminBarDismissed] = useState(() => {
    return localStorage.getItem('adminBarDismissed') === 'true';
  });

  const handleDismissAdminBar = () => {
    setAdminBarDismissed(true);
    localStorage.setItem('adminBarDismissed', 'true');
  };

  const handleShowAdminBar = () => {
    setAdminBarDismissed(false);
    localStorage.setItem('adminBarDismissed', 'false');
  };

  return {
    showLoginDialog,
    setShowLoginDialog,
    shouldRedirect,
    setShouldRedirect,
    adminBarDismissed,
    setAdminBarDismissed,
    handleDismissAdminBar,
    handleShowAdminBar
  };
};
