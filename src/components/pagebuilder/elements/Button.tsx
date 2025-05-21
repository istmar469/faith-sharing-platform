
import React from 'react';
import { Button as UIButton } from "@/components/ui/button";

interface ButtonElementProps {
  text: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  action?: string;
}

const Button: React.FC<ButtonElementProps> = ({ 
  text = 'Button', 
  variant = 'default',
  size = 'default',
  action = '#'
}) => {
  return (
    <UIButton variant={variant} size={size}>
      {text}
    </UIButton>
  );
};

export default Button;
