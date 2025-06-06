import React from 'react';

export interface FlexibleHeaderProps {
  backgroundColor?: string;
  padding?: string;
  height?: string;
  borderBottom?: boolean;
  sticky?: boolean;
  maxWidth?: string;
  logoSection?: any; // Puck slot
  navigationSection?: any; // Puck slot
  actionsSection?: any; // Puck slot
  puck?: any;
}

export const FlexibleHeader: React.FC<FlexibleHeaderProps> = ({
  backgroundColor = '#ffffff',
  padding = '0 1rem',
  height = '70px',
  borderBottom = true,
  sticky = true,
  maxWidth = '1200px',
  logoSection: LogoSection,
  navigationSection: NavigationSection,
  actionsSection: ActionsSection,
  puck
}) => {
  return (
    <header
      className={`flexible-header ${sticky ? 'sticky top-0 z-50' : ''}`}
      style={{
        backgroundColor,
        borderBottom: borderBottom ? '1px solid #e5e7eb' : 'none',
        boxShadow: sticky ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        width: '100%'
      }}
      ref={puck?.dragRef}
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
        {/* Logo Section - Left */}
        <div 
          className="header-logo-zone" 
          style={{ 
            flex: '0 0 auto',
            minWidth: '200px'
          }}
        >
          {LogoSection}
        </div>

        {/* Navigation Section - Center */}
        <div 
          className="header-navigation-zone" 
          style={{ 
            flex: '1 1 auto', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {NavigationSection}
        </div>

        {/* Actions Section - Right */}
        <div 
          className="header-actions-zone" 
          style={{ 
            flex: '0 0 auto',
            minWidth: '150px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {ActionsSection}
        </div>
      </div>
    </header>
  );
};

export default FlexibleHeader; 