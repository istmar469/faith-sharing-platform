import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color?: string;
  }>;
  columns?: 2 | 3 | 4;
  layout?: 'card' | 'minimal' | 'icon-left';
  backgroundColor?: string;
  textColor?: string;
  cardStyle?: 'elevated' | 'bordered' | 'flat';
  showIcons?: boolean;
  iconSize?: 'small' | 'medium' | 'large';
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  title = "Powerful Features for Modern Churches",
  subtitle = "Everything you need to grow your community",
  description = "Our comprehensive platform provides all the tools your church needs to thrive in the digital age.",
  features = [
    {
      id: '1',
      title: 'Beautiful Websites',
      description: 'Create stunning, responsive websites with our drag-and-drop builder.',
      icon: '🎨',
      color: '#3b82f6'
    },
    {
      id: '2',
      title: 'Member Management',
      description: 'Keep track of your congregation with powerful member management tools.',
      icon: '👥',
      color: '#10b981'
    },
    {
      id: '3',
      title: 'Event Planning',
      description: 'Organize and promote church events with integrated calendar and RSVP.',
      icon: '📅',
      color: '#f59e0b'
    },
    {
      id: '4',
      title: 'Online Giving',
      description: 'Accept donations securely with integrated payment processing.',
      icon: '💝',
      color: '#ef4444'
    },
    {
      id: '5',
      title: 'Communication Tools',
      description: 'Stay connected with email newsletters, SMS, and announcements.',
      icon: '📢',
      color: '#8b5cf6'
    },
    {
      id: '6',
      title: 'Analytics & Reports',
      description: 'Track growth and engagement with detailed analytics and reports.',
      icon: '📊',
      color: '#06b6d4'
    }
  ],
  columns = 3,
  layout = 'card',
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  cardStyle = 'elevated',
  showIcons = true,
  iconSize = 'medium'
}) => {
  const getGridClasses = () => {
    const baseClasses = "grid gap-6 md:gap-8";
    switch (columns) {
      case 2:
        return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      case 4:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
  };

  const getCardClasses = () => {
    const baseClasses = "h-full transition-all duration-200";
    
    switch (cardStyle) {
      case 'bordered':
        return `${baseClasses} border border-gray-200 rounded-lg p-6 hover:border-gray-300`;
      case 'flat':
        return `${baseClasses} p-6`;
      default:
        return `${baseClasses} bg-white rounded-lg p-6 shadow-sm hover:shadow-md`;
    }
  };

  const getIconClasses = () => {
    switch (iconSize) {
      case 'small':
        return 'text-2xl';
      case 'large':
        return 'text-5xl';
      default:
        return 'text-3xl';
    }
  };

  const renderFeature = (feature: any) => {
    if (layout === 'icon-left') {
      return (
        <div key={feature.id} className={getCardClasses()}>
          <div className="flex items-start space-x-4">
            {showIcons && (
              <div 
                className={`flex-shrink-0 ${getIconClasses()}`}
                style={{ color: feature.color }}
              >
                {feature.icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (layout === 'minimal') {
      return (
        <div key={feature.id} className={getCardClasses()}>
          <div className="text-center">
            {showIcons && (
              <div 
                className={`${getIconClasses()} mb-3`}
                style={{ color: feature.color }}
              >
                {feature.icon}
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      );
    }

    // Default card layout
    return (
      <div key={feature.id} className={getCardClasses()}>
        <div className="text-center">
          {showIcons && (
            <div 
              className={`${getIconClasses()} mb-4`}
              style={{ color: feature.color }}
            >
              {feature.icon}
            </div>
          )}
          <h3 className="text-xl font-semibold mb-3" style={{ color: textColor }}>
            {feature.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section 
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-lg font-medium mb-2 text-blue-600">
              {subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
            {title}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className={getGridClasses()}>
          {features.map(renderFeature)}
        </div>
      </div>
    </section>
  );
};

export const featureGridConfig: ComponentConfig<FeatureGridProps> = {
  render: (props: FeatureGridProps) => <FeatureGrid {...props} />,
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle'
    },
    description: {
      type: 'textarea',
      label: 'Description'
    },
    features: {
      type: 'array',
      label: 'Features',
      arrayFields: {
        id: {
          type: 'text',
          label: 'ID'
        },
        title: {
          type: 'text',
          label: 'Feature Title'
        },
        description: {
          type: 'textarea',
          label: 'Feature Description'
        },
        icon: {
          type: 'text',
          label: 'Icon (emoji or text)'
        },
        color: {
          type: 'text',
          label: 'Icon Color'
        }
      },
      getItemSummary: (item: any) => item.title || 'Feature'
    },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 }
      ]
    },
    layout: {
      type: 'select',
      label: 'Layout Style',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Icon Left', value: 'icon-left' }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    cardStyle: {
      type: 'select',
      label: 'Card Style',
      options: [
        { label: 'Elevated', value: 'elevated' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Flat', value: 'flat' }
      ]
    },
    showIcons: {
      type: 'radio',
      label: 'Show Icons',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    iconSize: {
      type: 'select',
      label: 'Icon Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    }
  },
  defaultProps: {
    title: "Powerful Features for Modern Churches",
    subtitle: "Everything you need to grow your community",
    description: "Our comprehensive platform provides all the tools your church needs to thrive in the digital age.",
    features: [
      {
        id: '1',
        title: 'Beautiful Websites',
        description: 'Create stunning, responsive websites with our drag-and-drop builder.',
        icon: '🎨',
        color: '#3b82f6'
      },
      {
        id: '2',
        title: 'Member Management',
        description: 'Keep track of your congregation with powerful member management tools.',
        icon: '👥',
        color: '#10b981'
      },
      {
        id: '3',
        title: 'Event Planning',
        description: 'Organize and promote church events with integrated calendar and RSVP.',
        icon: '📅',
        color: '#f59e0b'
      },
      {
        id: '4',
        title: 'Online Giving',
        description: 'Accept donations securely with integrated payment processing.',
        icon: '💝',
        color: '#ef4444'
      },
      {
        id: '5',
        title: 'Communication Tools',
        description: 'Stay connected with email newsletters, SMS, and announcements.',
        icon: '📢',
        color: '#8b5cf6'
      },
      {
        id: '6',
        title: 'Analytics & Reports',
        description: 'Track growth and engagement with detailed analytics and reports.',
        icon: '📊',
        color: '#06b6d4'
      }
    ],
    columns: 3,
    layout: 'card',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    cardStyle: 'elevated',
    showIcons: true,
    iconSize: 'medium'
  }
}; 