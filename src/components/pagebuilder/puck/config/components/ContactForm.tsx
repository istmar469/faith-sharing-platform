
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ContactFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  layout?: 'card' | 'minimal' | 'sidebar';
}

export const ContactForm: React.FC<ContactFormProps> = ({
  title = 'Get in Touch',
  subtitle = 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  buttonText = 'Send Message',
  layout = 'card'
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {buttonText}
      </Button>
    </form>
  );

  if (layout === 'minimal') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
        {formContent}
      </div>
    );
  }

  if (layout === 'sidebar') {
    return (
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{subtitle}</p>
          <div className="space-y-4 text-sm text-gray-600">
            <div>📧 hello@company.com</div>
            <div>📞 (555) 123-4567</div>
            <div>📍 123 Business Ave, City, State 12345</div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          {formContent}
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      {formContent}
    </div>
  );
};
