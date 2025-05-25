
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  isExternal?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'linkedin';
  url: string;
}

export interface EnhancedFooterProps {
  showFooter?: boolean;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  backgroundColor?: string;
  textColor?: string;
  layout?: '1-column' | '2-column' | '3-column' | '4-column';
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
  copyrightText?: string;
  showServiceTimes?: boolean;
  serviceTimes?: string[];
  organizationBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

const EnhancedFooter: React.FC<EnhancedFooterProps> = ({
  showFooter = true,
  companyName = 'Our Church',
  address = '123 Church Street, City, State 12345',
  phone = '(555) 123-4567',
  email = 'info@church.com',
  sections = [],
  socialLinks = [],
  backgroundColor = 'gray-900',
  textColor = 'white',
  layout = '3-column',
  showNewsletter = true,
  newsletterTitle = 'Stay Connected',
  newsletterDescription = 'Subscribe to our newsletter for updates and announcements.',
  copyrightText,
  showServiceTimes = true,
  serviceTimes = ['Sunday: 9:00 AM & 11:00 AM', 'Wednesday: 7:00 PM'],
  organizationBranding = {}
}) => {
  const [email_input, setEmailInput] = useState('');

  if (!showFooter) {
    return null;
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      default: return null;
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email_input);
    setEmailInput('');
  };

  const getGridColumns = () => {
    switch (layout) {
      case '1-column': return 'grid-cols-1';
      case '2-column': return 'grid-cols-1 md:grid-cols-2';
      case '3-column': return 'grid-cols-1 md:grid-cols-3';
      case '4-column': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-3';
    }
  };

  const CompanyInfoSection = () => (
    <div className="space-y-4">
      <h3 
        className="text-lg font-semibold"
        style={{ 
          color: organizationBranding.primaryColor || textColor,
          fontFamily: organizationBranding.fontFamily 
        }}
      >
        {companyName}
      </h3>
      <div className="space-y-3">
        {address && (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{email}</span>
          </div>
        )}
      </div>
      
      {socialLinks.length > 0 && (
        <div className="flex space-x-4 pt-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors"
              style={{ color: organizationBranding.primaryColor }}
            >
              {getSocialIcon(social.platform)}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const ServiceTimesSection = () => {
    if (!showServiceTimes || serviceTimes.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Visit Us</h3>
        <p className="text-sm mb-4">
          Join us for worship and fellowship. Everyone is welcome!
        </p>
        <div className="text-sm space-y-1">
          <p className="font-medium">Service Times:</p>
          {serviceTimes.map((time, index) => (
            <p key={index}>{time}</p>
          ))}
        </div>
      </div>
    );
  };

  const NewsletterSection = () => {
    if (!showNewsletter) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{newsletterTitle}</h3>
        <p className="text-sm">{newsletterDescription}</p>
        <form onSubmit={handleNewsletterSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email_input}
            onChange={(e) => setEmailInput(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            required
          />
          <Button 
            type="submit" 
            className="w-full"
            style={{ backgroundColor: organizationBranding.primaryColor }}
          >
            Subscribe
          </Button>
        </form>
      </div>
    );
  };

  const LinkSections = () => (
    <>
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <div className="space-y-2">
            {section.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.target || '_self'}
                className="block text-sm hover:text-blue-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <footer className={`bg-${backgroundColor} text-${textColor}`}>
      <div className="container mx-auto px-4 py-12">
        <div className={`grid ${getGridColumns()} gap-8`}>
          <CompanyInfoSection />
          <LinkSections />
          {layout !== '1-column' && <ServiceTimesSection />}
          {layout !== '1-column' && layout !== '2-column' && <NewsletterSection />}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm">
            {copyrightText || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
