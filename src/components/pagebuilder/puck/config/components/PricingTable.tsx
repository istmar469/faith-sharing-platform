import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface PricingTableProps {
  title?: string;
  subtitle?: string;
  description?: string;
  plans?: Array<{
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonUrl: string;
    popular?: boolean;
    color?: string;
  }>;
  layout?: 'cards' | 'table';
  showAnnualDiscount?: boolean;
  annualDiscountText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  title = "Choose Your Plan",
  subtitle = "Flexible pricing for churches of all sizes",
  description = "Start with our free plan and upgrade as your church grows. All plans include our core features.",
  plans = [
    {
      id: '1',
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for small churches getting started',
      features: [
        'Basic website builder',
        'Up to 100 members',
        'Email support',
        'Basic templates',
        'SSL certificate'
      ],
      buttonText: 'Get Started',
      buttonUrl: '/signup',
      popular: false,
      color: '#6b7280'
    },
    {
      id: '2',
      name: 'Growth',
      price: '$29',
      period: 'per month',
      description: 'For growing churches with active communities',
      features: [
        'Advanced website builder',
        'Up to 500 members',
        'Event management',
        'Online giving',
        'Email campaigns',
        'Priority support',
        'Custom domain'
      ],
      buttonText: 'Start Free Trial',
      buttonUrl: '/signup?plan=growth',
      popular: true,
      color: '#3b82f6'
    },
    {
      id: '3',
      name: 'Pro',
      price: '$79',
      period: 'per month',
      description: 'For established churches with advanced needs',
      features: [
        'Everything in Growth',
        'Unlimited members',
        'Advanced analytics',
        'Multi-site management',
        'API access',
        'White-label options',
        'Dedicated support'
      ],
      buttonText: 'Contact Sales',
      buttonUrl: '/contact',
      popular: false,
      color: '#7c3aed'
    }
  ],
  layout = 'cards',
  showAnnualDiscount = true,
  annualDiscountText = "Save 20% with annual billing",
  backgroundColor = '#f9fafb',
  textColor = '#1f2937'
}) => {
  const getPlanCardClasses = (plan: any) => {
    const baseClasses = "relative rounded-2xl p-8 transition-all duration-200 hover:scale-105";
    
    if (plan.popular) {
      return `${baseClasses} bg-white border-2 border-blue-500 shadow-xl`;
    }
    
    return `${baseClasses} bg-white border border-gray-200 shadow-sm hover:shadow-md`;
  };

  const getButtonClasses = (plan: any) => {
    const baseClasses = "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200";
    
    if (plan.popular) {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
    }
    
    return `${baseClasses} border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50`;
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
              {description}
            </p>
          )}
          {showAnnualDiscount && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {annualDiscountText}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={getPlanCardClasses(plan)}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: plan.color }}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold" style={{ color: textColor }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
                      style={{ color: plan.color }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={plan.buttonUrl}
                className={getButtonClasses(plan)}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Need a custom solution? <a href="/contact" className="text-blue-600 hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export const pricingTableConfig: ComponentConfig<PricingTableProps> = {
  render: (props: PricingTableProps) => <PricingTable {...props} />,
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
    plans: {
      type: 'array',
      label: 'Pricing Plans',
      arrayFields: {
        id: {
          type: 'text',
          label: 'ID'
        },
        name: {
          type: 'text',
          label: 'Plan Name'
        },
        price: {
          type: 'text',
          label: 'Price'
        },
        period: {
          type: 'text',
          label: 'Billing Period'
        },
        description: {
          type: 'textarea',
          label: 'Plan Description'
        },
        features: {
          type: 'textarea',
          label: 'Features (one per line)'
        },
        buttonText: {
          type: 'text',
          label: 'Button Text'
        },
        buttonUrl: {
          type: 'text',
          label: 'Button URL'
        },
        popular: {
          type: 'radio',
          label: 'Popular Plan',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        color: {
          type: 'text',
          label: 'Accent Color'
        }
      },
      getItemSummary: (item: any) => item.name || 'Plan'
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'Table', value: 'table' }
      ]
    },
    showAnnualDiscount: {
      type: 'radio',
      label: 'Show Annual Discount',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    annualDiscountText: {
      type: 'text',
      label: 'Annual Discount Text'
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    }
  },
  defaultProps: {
    title: "Choose Your Plan",
    subtitle: "Flexible pricing for churches of all sizes",
    description: "Start with our free plan and upgrade as your church grows. All plans include our core features.",
    plans: [
      {
        id: '1',
        name: 'Starter',
        price: 'Free',
        period: 'forever',
        description: 'Perfect for small churches getting started',
        features: [
          'Basic website builder',
          'Up to 100 members',
          'Email support',
          'Basic templates',
          'SSL certificate'
        ],
        buttonText: 'Get Started',
        buttonUrl: '/signup',
        popular: false,
        color: '#6b7280'
      },
      {
        id: '2',
        name: 'Growth',
        price: '$29',
        period: 'per month',
        description: 'For growing churches with active communities',
        features: [
          'Advanced website builder',
          'Up to 500 members',
          'Event management',
          'Online giving',
          'Email campaigns',
          'Priority support',
          'Custom domain'
        ],
        buttonText: 'Start Free Trial',
        buttonUrl: '/signup?plan=growth',
        popular: true,
        color: '#3b82f6'
      },
      {
        id: '3',
        name: 'Pro',
        price: '$79',
        period: 'per month',
        description: 'For established churches with advanced needs',
        features: [
          'Everything in Growth',
          'Unlimited members',
          'Advanced analytics',
          'Multi-site management',
          'API access',
          'White-label options',
          'Dedicated support'
        ],
        buttonText: 'Contact Sales',
        buttonUrl: '/contact',
        popular: false,
        color: '#7c3aed'
      }
    ],
    layout: 'cards',
    showAnnualDiscount: true,
    annualDiscountText: "Save 20% with annual billing",
    backgroundColor: '#f9fafb',
    textColor: '#1f2937'
  }
}; 