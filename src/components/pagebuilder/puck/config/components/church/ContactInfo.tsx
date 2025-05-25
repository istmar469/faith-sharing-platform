
import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { ComponentConfig } from '@measured/puck';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ChurchInfo {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
}

export interface ContactInfoProps {
  title?: string;
  layout?: 'vertical' | 'horizontal' | 'card';
  showIcons?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  title = 'Contact Us',
  layout = 'vertical',
  showIcons = true,
  backgroundColor = 'white',
  textColor = 'gray-900'
}) => {
  const { organizationId } = useTenantContext();
  const [churchInfo, setChurchInfo] = useState<ChurchInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChurchInfo = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('church_info')
          .select('phone, email, address, city, state, zip_code, website')
          .eq('organization_id', organizationId)
          .single();

        if (error) throw error;
        setChurchInfo(data || {});
      } catch (error) {
        console.error('Error fetching church info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChurchInfo();
  }, [organizationId]);

  if (loading) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip_code]
    .filter(Boolean)
    .join(', ');

  const contactItems = [
    {
      icon: Phone,
      label: 'Phone',
      value: churchInfo.phone,
      href: `tel:${churchInfo.phone}`
    },
    {
      icon: Mail,
      label: 'Email',
      value: churchInfo.email,
      href: `mailto:${churchInfo.email}`
    },
    {
      icon: MapPin,
      label: 'Address',
      value: fullAddress,
      href: `https://maps.google.com?q=${encodeURIComponent(fullAddress)}`
    },
    {
      icon: Globe,
      label: 'Website',
      value: churchInfo.website,
      href: churchInfo.website
    }
  ].filter(item => item.value);

  const layoutClasses = {
    vertical: 'space-y-3',
    horizontal: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    card: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
  };

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      {contactItems.length === 0 ? (
        <p className="text-gray-500">No contact information available</p>
      ) : (
        <div className={layoutClasses[layout]}>
          {contactItems.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <div
                key={index}
                className={`${layout === 'card' ? 'p-4 border rounded-lg text-center' : 'flex items-center gap-3'}`}
              >
                {showIcons && (
                  <IconComponent className={`h-5 w-5 text-orange-600 ${layout === 'card' ? 'mx-auto mb-2' : 'flex-shrink-0'}`} />
                )}
                <div className={layout === 'card' ? '' : 'flex-1 min-w-0'}>
                  {layout === 'card' && (
                    <div className="font-medium text-sm text-gray-600 mb-1">{item.label}</div>
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-blue-600 hover:text-blue-800 transition-colors break-words"
                      target={item.label === 'Website' ? '_blank' : undefined}
                      rel={item.label === 'Website' ? 'noopener noreferrer' : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="break-words">{item.value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const contactInfoConfig: ComponentConfig<ContactInfoProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Card', value: 'card' }
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
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    }
  },
  render: (props) => <ContactInfo {...props} />
};

export default ContactInfo;
