import React, { useState, useEffect } from 'react';
import { DropZone } from '@measured/puck';
import { Menu, X } from 'lucide-react';

export interface SimpleHeaderProps {
  backgroundColor?: string;
  height?: string;
  borderBottom?: boolean;
  sticky?: boolean;
  maxWidth?: string;
  padding?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  backgroundColor = '#ffffff',
  height = '70px',
  borderBottom = true,
  sticky = true,
  maxWidth = '1200px',
  padding = '0 1rem'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScreenSize = () => {
      try {
        setIsDesktop(window.innerWidth >= 1280); // xl breakpoint
      } catch (error) {
        console.warn('SimpleHeader: Error checking screen size:', error);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeDropdown = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when screen becomes desktop
  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop, isMobileMenuOpen]);

  return (
    <>
      <header
        className={`simple-header ${sticky ? 'sticky top-0 z-50' : ''}`}
        style={{
          backgroundColor,
          borderBottom: borderBottom ? '1px solid #e5e7eb' : 'none',
          boxShadow: sticky ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          width: '100%'
        }}
      >
        <div
          style={{
            maxWidth,
            margin: '0 auto',
            padding,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Logo Section - Always visible */}
          <div 
            className="header-logo-zone" 
            style={{ 
              flex: '0 0 auto',
              minWidth: '200px'
            }}
          >
            <DropZone zone="logo" />
          </div>

          {/* Desktop Navigation - Only visible on desktop */}
          {isDesktop && (
            <div 
              className="header-navigation-zone desktop-navigation" 
              style={{ 
                flex: '1 1 auto', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <DropZone zone="navigation" />
            </div>
          )}

          {/* Desktop Actions - Only visible on desktop */}
          {isDesktop && (
            <div 
              className="header-actions-zone desktop-actions" 
              style={{ 
                flex: '0 0 auto',
                minWidth: '150px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <DropZone zone="actions" />
            </div>
          )}

          {/* Mobile/Tablet Right Section - Visible when not desktop */}
          {!isDesktop && (
            <div className="flex items-center gap-3">
              {/* Mobile Actions (for auth button) */}
              <div className="mobile-actions">
                <DropZone zone="actions" />
              </div>
              
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle mobile menu"
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                {isMobileMenuOpen ? (
                  <X size={24} color="#000" />
                ) : (
                  <Menu size={24} color="#000" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Dropdown - Only show when hamburger menu is open AND not desktop */}
        {!isDesktop && isMobileMenuOpen && (
          <div
            className="mobile-menu-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor,
              borderTop: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 50,
              maxHeight: isMobileMenuOpen ? '400px' : '0px',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
            }}
          >
            <div 
              style={{ 
                padding: '1rem',
                transition: 'opacity 0.3s ease-in-out 0.1s',
                opacity: isMobileMenuOpen ? 1 : 0
              }}
            >
              {/* Mobile Navigation - Only navigation links, no auth buttons */}
              <div 
                className="mobile-navigation"
                style={{
                  marginBottom: '1rem'
                }}
              >
                <DropZone zone="navigation" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {!isDesktop && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ 
            top: height,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            animation: 'fadeIn 0.3s ease-out',
            transition: 'opacity 0.3s ease-out'
          }}
        />
      )}

      {/* Add keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

// Simple Header Configuration
export const simpleHeaderConfig = {
  fields: {
    backgroundColor: {
      type: 'text' as const,
      label: 'Background Color',
    },
    height: {
      type: 'text' as const,
      label: 'Height',
    },
    borderBottom: {
      type: 'radio' as const,
      label: 'Show Border Bottom',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    sticky: {
      type: 'radio' as const,
      label: 'Sticky Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    maxWidth: {
      type: 'text' as const,
      label: 'Max Width',
    },
    padding: {
      type: 'text' as const,
      label: 'Padding',
    },
  },
  defaultProps: {
    backgroundColor: '#ffffff',
    height: '70px',
    borderBottom: true,
    sticky: true,
    maxWidth: '1200px',
    padding: '0 1rem',
  },
  render: SimpleHeader,
};

export default SimpleHeader; 