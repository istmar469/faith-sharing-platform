
import React from 'react';
import { Phone } from 'lucide-react';

const ContactInfoTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Phone className="h-4 w-4 text-orange-600" />
        <span className="font-medium text-sm">Contact Info</span>
      </div>
      <p className="text-xs text-gray-600">
        Show church contact details with customizable display options
      </p>
    </div>
  );
};

export default ContactInfoTab;
