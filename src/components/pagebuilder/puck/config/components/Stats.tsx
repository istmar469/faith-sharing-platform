
import React from 'react';

export interface StatsProps {
  stats?: Array<{
    number: string;
    label: string;
    description?: string;
  }>;
  layout?: 'horizontal' | 'grid' | 'minimal';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const Stats: React.FC<StatsProps> = ({
  stats = [
    { number: '10K+', label: 'Happy Customers', description: 'Worldwide' },
    { number: '99%', label: 'Satisfaction Rate', description: 'Customer feedback' },
    { number: '24/7', label: 'Support', description: 'Always available' },
    { number: '5★', label: 'Rating', description: 'App stores' }
  ],
  layout = 'grid',
  color = 'blue'
}) => {
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
    <div className={`${layoutClasses[layout]} py-8`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`text-3xl md:text-4xl font-bold ${colorClasses[color]} mb-2`}>
            {stat.number}
          </div>
          <div className="text-gray-900 font-semibold mb-1">
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-sm text-gray-600">
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
