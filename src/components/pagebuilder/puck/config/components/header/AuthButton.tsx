import React, { useState, useEffect, useRef } from 'react';
import { DropZone } from '@measured/puck';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import LoginDialog from '@/components/auth/LoginDialog';

interface AuthButtonProps {
  text?: string;
  showUserInfo?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  text = "Sign in", 
  showUserInfo = true
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get subdomain context from TenantContext
  const { isSubdomainAccess } = useTenantContext();
  
  // Debug logging
  useEffect(() => {
    console.log('AuthButton Debug:', {
      user,
      isSubdomainAccess,
      isLoading,
      hostname: window.location.hostname
    });
  }, [user, isSubdomainAccess, isLoading]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    setShowLoginDialog(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // After logout, refresh the current page to update auth state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsDropdownOpen(false);
  };

  const navigateToDashboard = () => {
    setIsDropdownOpen(false);
    if (isSubdomainAccess) {
      // For subdomains, go to organization-specific dashboard within the same subdomain
      // This works for both localhost subdomains (test3.localhost:8086) and production subdomains (test3.church-os.com)
      window.location.href = `${window.location.origin}/dashboard`;
    } else {
      // For main domain, go to super admin dashboard
      // This works for both localhost and production main domains
      window.location.href = '/dashboard';
    }
  };

  const toggleDropdown = () => {
    console.log('AuthButton: Toggling dropdown. Current state:', isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Always render a consistent container with dragRef
  return (
    <>
      <div 
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {isLoading ? (
          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'not-allowed',
              opacity: '0.6'
            }}
          >
            <User size={20} />
            {text && <span>{text}</span>}
          </button>
        ) : !user ? (
          <button
            onClick={handleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderRadius: '0.375rem',
              transition: 'all 0.2s'
            }}
          >
            <User size={20} />
            {text && <span>{text}</span>}
          </button>
        ) : (
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleDropdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '0.375rem'
              }}
            >
              <User size={20} />
              {showUserInfo && (
                <span>
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                </span>
              )}
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: `rotate(${isDropdownOpen ? '180deg' : '0deg'})`,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 50,
                  minWidth: '200px',
                  padding: '0.5rem 0'
                }}
                ref={dropdownRef}
              >
                {/* User info */}
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
                    {user.user_metadata?.full_name || 'User'}
                  </div>
                  <div>{user.email}</div>
                </div>

                {/* Dashboard button */}
                <button
                  onClick={navigateToDashboard}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    color: '#374151',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    try {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    } catch (error) {
                      console.error('Hover effect error:', error);
                    }
                  }}
                  onMouseLeave={(e) => {
                    try {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } catch (error) {
                      console.error('Hover effect error:', error);
                    }
                  }}
                >
                  <Settings size={16} />
                  {isSubdomainAccess ? 'Dashboard' : 'Super Admin'}
                </button>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    color: '#dc2626',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    try {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    } catch (error) {
                      console.error('Hover effect error:', error);
                    }
                  }}
                  onMouseLeave={(e) => {
                    try {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } catch (error) {
                      console.error('Hover effect error:', error);
                    }
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Login Dialog */}
      <LoginDialog 
        isOpen={showLoginDialog} 
        setIsOpen={setShowLoginDialog} 
      />
    </>
  );
};

// AuthButton Component Configuration
export const authButtonConfig = {
  fields: {
    text: {
      type: 'text' as const,
      label: 'Text',
    },
    showUserInfo: {
      type: 'radio' as const,
      label: 'Show User Info',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    text: 'Sign in',
    showUserInfo: true,
  },
  render: AuthButton,
};

export default AuthButton; 