
import React, { useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Button } from '@/components/ui/button';

export interface ContactFormProps {
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  showMessage?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  title = 'Contact Us',
  backgroundColor = 'white',
  textColor = 'gray-900',
  showMessage = true
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {showMessage && (
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}
        
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>
    </div>
  );
};

export const contactFormConfig: ComponentConfig<ContactFormProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    showMessage: {
      type: 'radio',
      label: 'Show Message Field',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    }
  },
  render: (props) => <ContactForm {...props} />
};

export default ContactForm;
