
import React, { useEffect, useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ContactInfoProps {
  title: string;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showWebsite: boolean;
  layout: 'horizontal' | 'vertical' | 'grid';
  primaryColor: string;
}

interface ChurchInfo {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  title = 'Contact Us',
  showEmail = true,
  showPhone = true,
  showAddress = true,
  showWebsite = true,
  layout = 'vertical',
  primaryColor = '#3b82f6'
}) => {
  const { organizationId } = useTenantContext();
  const [churchInfo, setChurchInfo] = useState<ChurchInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchChurchInfo = async () => {
      try {
        const { data } = await supabase
          .from('church_info')
          .select('phone, email, address, city, state, zip_code, website')
          .eq('organization_id', organizationId)
          .single();

        if (data) {
          setChurchInfo(data);
        }
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
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-6',
    vertical: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  };

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip_code]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 
        className="text-2xl font-bold mb-6"
        style={{ color: primaryColor }}
      >
        {title}
      </h3>
      
      <div className={layoutClasses[layout]}>
        {showPhone && churchInfo.phone && (
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Phone className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <a 
                href={`tel:${churchInfo.phone}`}
                className="text-gray-600 hover:underline"
              >
                {churchInfo.phone}
              </a>
            </div>
          </div>
        )}

        {showEmail && churchInfo.email && (
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Mail className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="font-medium">Email</p>
              <a 
                href={`mailto:${churchInfo.email}`}
                className="text-gray-600 hover:underline"
              >
                {churchInfo.email}
              </a>
            </div>
          </div>
        )}

        {showAddress && fullAddress && (
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600">{fullAddress}</p>
            </div>
          </div>
        )}

        {showWebsite && churchInfo.website && (
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Globe className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="font-medium">Website</p>
              <a 
                href={churchInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:underline"
              >
                {churchInfo.website}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const contactInfoConfig: ComponentConfig<ContactInfoProps> = {
  fields: {
    title: { type: 'text' },
    showEmail: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    showPhone: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    showAddress: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    showWebsite: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    layout: { 
      type: 'select', 
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
        { value: 'grid', label: 'Grid' }
      ]
    },
    primaryColor: { type: 'text' }
  },
  defaultProps: {
    title: 'Contact Us',
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showWebsite: true,
    layout: 'vertical',
    primaryColor: '#3b82f6'
  },
  render: ContactInfo
};

export default ContactInfo;
