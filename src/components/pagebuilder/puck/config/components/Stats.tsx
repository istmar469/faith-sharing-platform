import React, { useState, useEffect } from 'react';
import { ComponentConfig } from '@measured/puck';

export interface StatsProps {
  title?: string;
  // Individual stat configuration
  stat1Number?: string;
  stat1Label?: string;
  stat1Description?: string;
  stat1Enabled?: boolean;
  
  stat2Number?: string;
  stat2Label?: string;
  stat2Description?: string;
  stat2Enabled?: boolean;
  
  stat3Number?: string;
  stat3Label?: string;
  stat3Description?: string;
  stat3Enabled?: boolean;
  
  stat4Number?: string;
  stat4Label?: string;
  stat4Description?: string;
  stat4Enabled?: boolean;
  
  // Layout and styling
  layout?: 'horizontal' | 'grid' | 'minimal';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  showAnimations?: boolean;
  backgroundColor?: string;
  padding?: 'small' | 'medium' | 'large';
}

// Animated Counter Component
const AnimatedNumber: React.FC<{ 
  value: string; 
  duration?: number; 
  className?: string;
  animate?: boolean;
}> = ({ value, duration = 2000, className = '', animate = true }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Extract numeric value for animation
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    const suffix = value.replace(/[\d.]/g, '');
    
    if (!animate || isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          const startTime = Date.now();
          const startValue = 0;
          
          const animateValue = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (numericValue - startValue) * easeOut);
            
            setDisplayValue(currentValue + suffix);
            
            if (progress < 1) {
              requestAnimationFrame(animateValue);
            }
          };
          
          animateValue();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`stat-${value}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [value, duration, animate, isVisible]);

  return (
    <div 
      id={`stat-${value}`}
      className={className}
    >
      {displayValue}
    </div>
  );
};

export const Stats: React.FC<StatsProps> = (rawProps) => {
  // Safe prop extraction with defaults
  const title = typeof rawProps.title === 'string' ? rawProps.title : '';
  
  const stat1Enabled = rawProps.stat1Enabled !== false; // Default to true
  const stat2Enabled = rawProps.stat2Enabled !== false; // Default to true  
  const stat3Enabled = rawProps.stat3Enabled !== false; // Default to true
  const stat4Enabled = rawProps.stat4Enabled !== false; // Default to true
  
  const safeLayout = ['horizontal', 'grid', 'minimal'].includes(rawProps.layout as string) ? rawProps.layout : 'grid';
  const safeColor = ['blue', 'green', 'purple', 'orange', 'red', 'indigo'].includes(rawProps.color as string) ? rawProps.color : 'blue';
  const showAnimations = rawProps.showAnimations !== false; // Default to true
  const backgroundColor = typeof rawProps.backgroundColor === 'string' ? rawProps.backgroundColor : 'transparent';
  const padding = ['small', 'medium', 'large'].includes(rawProps.padding as string) ? rawProps.padding : 'medium';

  // Build stats array from individual props
  const stats = [
    stat1Enabled && {
      number: typeof rawProps.stat1Number === 'string' ? rawProps.stat1Number : '10K+',
      label: typeof rawProps.stat1Label === 'string' ? rawProps.stat1Label : 'Happy Customers',
      description: typeof rawProps.stat1Description === 'string' ? rawProps.stat1Description : 'Worldwide'
    },
    stat2Enabled && {
      number: typeof rawProps.stat2Number === 'string' ? rawProps.stat2Number : '99%',
      label: typeof rawProps.stat2Label === 'string' ? rawProps.stat2Label : 'Satisfaction Rate',
      description: typeof rawProps.stat2Description === 'string' ? rawProps.stat2Description : 'Customer feedback'
    },
    stat3Enabled && {
      number: typeof rawProps.stat3Number === 'string' ? rawProps.stat3Number : '24/7',
      label: typeof rawProps.stat3Label === 'string' ? rawProps.stat3Label : 'Support',
      description: typeof rawProps.stat3Description === 'string' ? rawProps.stat3Description : 'Always available'
    },
    stat4Enabled && {
      number: typeof rawProps.stat4Number === 'string' ? rawProps.stat4Number : '5★',
      label: typeof rawProps.stat4Label === 'string' ? rawProps.stat4Label : 'Rating',
      description: typeof rawProps.stat4Description === 'string' ? rawProps.stat4Description : 'App stores'
    }
  ].filter(Boolean); // Remove disabled stats

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  const layoutClasses = {
    horizontal: 'flex flex-wrap justify-center gap-8',
    grid: `grid ${stats.length === 1 ? 'grid-cols-1' : stats.length === 2 ? 'grid-cols-1 md:grid-cols-2' : stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} gap-6`,
    minimal: 'flex flex-wrap justify-center gap-12'
  };

  const paddingClasses = {
    small: 'py-4',
    medium: 'py-8', 
    large: 'py-12'
  };

  const containerStyle = backgroundColor !== 'transparent' ? { backgroundColor } : {};

  return (
    <div 
      className={`${paddingClasses[padding]} px-4`}
      style={containerStyle}
    >
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        </div>
      )}
      
      <div className={`${layoutClasses[safeLayout]} max-w-6xl mx-auto`}>
        {stats.map((stat, index) => {
          if (!stat) return null;
          
          return (
            <div key={index} className="text-center group">
              <AnimatedNumber 
                value={stat.number}
                animate={showAnimations}
                className={`text-3xl md:text-4xl lg:text-5xl font-bold ${colorClasses[safeColor]} mb-2 transition-transform group-hover:scale-110 duration-300`}
              />
              <div className="text-gray-900 font-semibold mb-1 text-lg">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-sm text-gray-600 max-w-xs mx-auto">
                  {stat.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const statsConfig: ComponentConfig<StatsProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Section Title'
    },
    
    // Stat 1
    stat1Enabled: {
      type: 'radio',
      label: 'Show Statistic 1',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    stat1Number: {
      type: 'text',
      label: 'Stat 1 - Number'
    },
    stat1Label: {
      type: 'text',
      label: 'Stat 1 - Label'
    },
    stat1Description: {
      type: 'text',
      label: 'Stat 1 - Description'
    },
    
    // Stat 2
    stat2Enabled: {
      type: 'radio',
      label: 'Show Statistic 2',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    stat2Number: {
      type: 'text',
      label: 'Stat 2 - Number'
    },
    stat2Label: {
      type: 'text',
      label: 'Stat 2 - Label'
    },
    stat2Description: {
      type: 'text',
      label: 'Stat 2 - Description'
    },
    
    // Stat 3
    stat3Enabled: {
      type: 'radio',
      label: 'Show Statistic 3',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    stat3Number: {
      type: 'text',
      label: 'Stat 3 - Number'
    },
    stat3Label: {
      type: 'text',
      label: 'Stat 3 - Label'
    },
    stat3Description: {
      type: 'text',
      label: 'Stat 3 - Description'
    },
    
    // Stat 4
    stat4Enabled: {
      type: 'radio',
      label: 'Show Statistic 4',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    stat4Number: {
      type: 'text',
      label: 'Stat 4 - Number'
    },
    stat4Label: {
      type: 'text',
      label: 'Stat 4 - Label'
    },
    stat4Description: {
      type: 'text',
      label: 'Stat 4 - Description'
    },
    
    // Layout and styling
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Minimal', value: 'minimal' }
      ]
    },
    color: {
      type: 'select',
      label: 'Color Theme',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Red', value: 'red' },
        { label: 'Indigo', value: 'indigo' }
      ]
    },
    showAnimations: {
      type: 'radio',
      label: 'Show Number Animations',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color (optional)'
    },
    padding: {
      type: 'select',
      label: 'Padding Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    }
  },
  defaultProps: {
    title: '',
    stat1Enabled: true,
    stat1Number: '10K+',
    stat1Label: 'Happy Customers',
    stat1Description: 'Worldwide',
    
    stat2Enabled: true,
    stat2Number: '99%',
    stat2Label: 'Satisfaction Rate',
    stat2Description: 'Customer feedback',
    
    stat3Enabled: true,
    stat3Number: '24/7',
    stat3Label: 'Support',
    stat3Description: 'Always available',
    
    stat4Enabled: true,
    stat4Number: '5★',
    stat4Label: 'Rating',
    stat4Description: 'App stores',
    
    layout: 'grid',
    color: 'blue',
    showAnimations: true,
    backgroundColor: 'transparent',
    padding: 'medium'
  },
  render: (props) => <Stats {...props} />
};
