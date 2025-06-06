import React from 'react';

export interface HeaderContainerProps {
  backgroundColor?: string;
  padding?: string;
  height?: string;
  borderBottom?: boolean;
  sticky?: boolean;
  logoSection?: React.ReactNode;
  navigationSection?: React.ReactNode;
  actionsSection?: React.ReactNode;
  puck?: any;
}

export const HeaderContainer: React.FC<HeaderContainerProps> = ({
  backgroundColor = '#ffffff',
  padding = '0 1rem',
  height = '70px',
  borderBottom = true,
  sticky = true,
  logoSection: LogoSection,
  navigationSection: NavigationSection,
  actionsSection: ActionsSection,
  puck
}) => {
  return (
    <header
      className={`header-container ${sticky ? 'sticky top-0 z-50' : ''}`}
      style={{
        backgroundColor,
        padding,
        height,
        borderBottom: borderBottom ? '1px solid #e5e7eb' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxShadow: sticky ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
      }}
      ref={puck?.dragRef}
    >
      {/* Logo Section */}
      <div className="header-logo-section" style={{ flex: '0 0 auto' }}>
        {LogoSection}
      </div>

      {/* Navigation Section */}
      <div className="header-navigation-section" style={{ 
        flex: '1 1 auto', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {NavigationSection}
      </div>

      {/* Actions Section */}
      <div className="header-actions-section" style={{ flex: '0 0 auto' }}>
        {ActionsSection}
      </div>
    </header>
  );
};

export default HeaderContainer; 