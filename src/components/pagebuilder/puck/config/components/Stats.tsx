import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface StatsProps {
  stats?: Array<{
    number: string;
    label: string;
    description?: string;
  }>;
  layout?: 'horizontal' | 'grid' | 'minimal';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const Stats: React.FC<StatsProps> = (rawProps) => {
  // Safe prop extraction with defaults
  const safeStats = (() => {
    if (!rawProps.stats) {
      return [
        { number: '10K+', label: 'Happy Customers', description: 'Worldwide' },
        { number: '99%', label: 'Satisfaction Rate', description: 'Customer feedback' },
        { number: '24/7', label: 'Support', description: 'Always available' },
        { number: '5★', label: 'Rating', description: 'App stores' }
      ];
    }
    
    // If stats is already an array, use it
    if (Array.isArray(rawProps.stats)) {
      return rawProps.stats;
    }
    
    // If stats is a string, try to parse it
    if (typeof rawProps.stats === 'string') {
      try {
        const parsed = JSON.parse(rawProps.stats);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn('Stats: Failed to parse stats string:', error);
      }
    }
    
    // Fallback to default stats
    return [
      { number: '10K+', label: 'Happy Customers', description: 'Worldwide' },
      { number: '99%', label: 'Satisfaction Rate', description: 'Customer feedback' },
      { number: '24/7', label: 'Support', description: 'Always available' },
      { number: '5★', label: 'Rating', description: 'App stores' }
    ];
  })();

  const safeLayout = ['horizontal', 'grid', 'minimal'].includes(rawProps.layout as string) ? rawProps.layout : 'grid';
  const safeColor = ['blue', 'green', 'purple', 'orange'].includes(rawProps.color as string) ? rawProps.color : 'blue';

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  const layoutClasses = {
    horizontal: 'flex flex-wrap justify-center gap-8',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-6',
    minimal: 'flex flex-wrap justify-center gap-12'
  };

  return (
    <div className={`${layoutClasses[safeLayout]} py-8`}>
      {safeStats.map((stat, index) => {
        // Ensure each stat object is valid
        const number = typeof stat?.number === 'string' ? stat.number : `${index + 1}`;
        const label = typeof stat?.label === 'string' ? stat.label : 'Statistic';
        const description = typeof stat?.description === 'string' ? stat.description : '';
        
        return (
          <div key={index} className="text-center">
            <div className={`text-3xl md:text-4xl font-bold ${colorClasses[safeColor]} mb-2`}>
              {number}
            </div>
            <div className="text-gray-900 font-semibold mb-1">
              {label}
            </div>
            {description && (
              <div className="text-sm text-gray-600">
                {description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const statsConfig: ComponentConfig<StatsProps> = {
  fields: {
    stats: {
      type: 'array',
      label: 'Statistics',
      arrayFields: {
        number: {
          type: 'text',
          label: 'Number/Value'
        },
        label: {
          type: 'text',
          label: 'Label'
        },
        description: {
          type: 'text',
          label: 'Description (optional)'
        }
      },
      defaultItemProps: {
        number: '100+',
        label: 'New Stat',
        description: 'Description'
      }
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Grid', value: 'grid' },
        { label: 'Minimal', value: 'minimal' }
      ]
    },
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' }
      ]
    }
  },
  defaultProps: {
    stats: [
      { number: '10K+', label: 'Happy Customers', description: 'Worldwide' },
      { number: '99%', label: 'Satisfaction Rate', description: 'Customer feedback' },
      { number: '24/7', label: 'Support', description: 'Always available' },
      { number: '5★', label: 'Rating', description: 'App stores' }
    ],
    layout: 'grid',
    color: 'blue'
  },
  render: (props) => <Stats {...props} />
};
