
import React from 'react';

export interface TestimonialProps {
  quote?: string;
  author?: string;
  position?: string;
  company?: string;
  avatar?: string;
  layout?: 'card' | 'minimal' | 'featured';
}

export const Testimonial: React.FC<TestimonialProps> = ({
  quote = "This product has completely transformed our workflow. Highly recommended!",
  author = "John Doe",
  position = "CEO",
  company = "Tech Corp",
  avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  layout = 'card'
}) => {
  if (layout === 'minimal') {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <blockquote className="text-lg italic text-gray-700 mb-4">
          "{quote}"
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
          <div className="text-left">
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-sm text-gray-600">{position}, {company}</p>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'featured') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl text-gray-800 mb-6">
            "{quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <img src={avatar} alt={author} className="w-16 h-16 rounded-full border-4 border-white shadow-md" />
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">{author}</p>
              <p className="text-gray-600">{position}</p>
              <p className="text-sm text-blue-600 font-medium">{company}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <blockquote className="text-gray-700 mb-4">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <img src={avatar} alt={author} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{position}, {company}</p>
        </div>
      </div>
    </div>
  );
};
