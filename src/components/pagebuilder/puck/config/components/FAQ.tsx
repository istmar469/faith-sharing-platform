import React, { useState } from 'react';
import { ComponentConfig } from '@measured/puck';

export interface FAQProps {
  title?: string;
  subtitle?: string;
  description?: string;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  layout?: 'accordion' | 'grid';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const FAQ: React.FC<FAQProps> = ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know",
  description = "Can't find the answer you're looking for? Reach out to our customer support team.",
  faqs = [
    {
      id: '1',
      question: 'How do I get started with Church-OS?',
      answer: 'Getting started is easy! Simply sign up for a free account, choose your template, and start customizing your church website. Our intuitive drag-and-drop builder makes it simple to create a beautiful site in minutes.'
    },
    {
      id: '2',
      question: 'Can I import my existing member data?',
      answer: 'Yes! We provide easy import tools to help you migrate your existing member database. You can import from CSV files or connect with popular church management systems.'
    },
    {
      id: '3',
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security measures including SSL encryption, regular backups, and secure data centers. Your church data is protected with the highest security standards.'
    },
    {
      id: '4',
      question: 'Can I accept online donations?',
      answer: 'Yes! Our platform includes integrated payment processing for secure online giving. We support credit cards, bank transfers, and recurring donations with low processing fees.'
    },
    {
      id: '5',
      question: 'Do you offer customer support?',
      answer: 'We provide comprehensive support including email support for all plans, priority support for Growth plans, and dedicated support for Pro plans. We also have extensive documentation and video tutorials.'
    },
    {
      id: '6',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your data will remain accessible during your billing period.'
    }
  ],
  layout = 'accordion',
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  accentColor = '#3b82f6'
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const renderAccordion = () => (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div 
          key={faq.id} 
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleItem(faq.id)}
            className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
          >
            <span className="font-medium text-lg" style={{ color: textColor }}>
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                openItems.includes(faq.id) ? 'rotate-180' : ''
              }`}
              style={{ color: accentColor }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.includes(faq.id) && (
            <div className="px-6 py-4 bg-white">
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-3" style={{ color: textColor }}>
            {faq.question}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <section 
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-lg font-medium mb-2" style={{ color: accentColor }}>
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

        {/* FAQ Content */}
        {layout === 'accordion' ? renderAccordion() : renderGrid()}

        {/* Contact CTA */}
        <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you get the most out of Church-OS.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: accentColor, 
              color: '#ffffff' 
            }}
          >
            Contact Support
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export const faqConfig: ComponentConfig<FAQProps> = {
  render: (props: FAQProps) => <FAQ {...props} />,
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
    faqs: {
      type: 'array',
      label: 'FAQ Items',
      arrayFields: {
        id: {
          type: 'text',
          label: 'ID'
        },
        question: {
          type: 'text',
          label: 'Question'
        },
        answer: {
          type: 'textarea',
          label: 'Answer'
        }
      },
      getItemSummary: (item: any) => item.question || 'FAQ Item'
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Accordion', value: 'accordion' },
        { label: 'Grid', value: 'grid' }
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
    accentColor: {
      type: 'text',
      label: 'Accent Color'
    }
  },
  defaultProps: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know",
    description: "Can't find the answer you're looking for? Reach out to our customer support team.",
    faqs: [
      {
        id: '1',
        question: 'How do I get started with Church-OS?',
        answer: 'Getting started is easy! Simply sign up for a free account, choose your template, and start customizing your church website. Our intuitive drag-and-drop builder makes it simple to create a beautiful site in minutes.'
      },
      {
        id: '2',
        question: 'Can I import my existing member data?',
        answer: 'Yes! We provide easy import tools to help you migrate your existing member database. You can import from CSV files or connect with popular church management systems.'
      },
      {
        id: '3',
        question: 'Is my data secure?',
        answer: 'Absolutely. We use enterprise-grade security measures including SSL encryption, regular backups, and secure data centers. Your church data is protected with the highest security standards.'
      },
      {
        id: '4',
        question: 'Can I accept online donations?',
        answer: 'Yes! Our platform includes integrated payment processing for secure online giving. We support credit cards, bank transfers, and recurring donations with low processing fees.'
      },
      {
        id: '5',
        question: 'Do you offer customer support?',
        answer: 'We provide comprehensive support including email support for all plans, priority support for Growth plans, and dedicated support for Pro plans. We also have extensive documentation and video tutorials.'
      },
      {
        id: '6',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your data will remain accessible during your billing period.'
      }
    ],
    layout: 'accordion',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6'
  }
}; 