
import React from 'react';

interface ParagraphProps {
  text: string;
}

const Paragraph: React.FC<ParagraphProps> = ({ text = 'Enter your text here...' }) => {
  return <p className="text-gray-600 mb-4">{text}</p>;
};

export default Paragraph;
