
export interface HeaderCustomization {
  logo?: string;
  logoText?: string;
  logoSize?: number;
  logoPosition?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl';
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  height?: number;
  paddingX?: number;
  paddingY?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isSticky?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  layout?: 'default' | 'centered' | 'minimal' | 'split';
  navigationStyle?: 'horizontal' | 'dropdown' | 'mega-menu';
  animationStyle?: 'none' | 'fade' | 'slide' | 'scale';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface HeaderProps extends HeaderCustomization {
  showNavigation?: boolean;
  enablePageManagement?: boolean;
  customNavigationItems?: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
  maxWidth?: 'full' | 'container' | 'lg' | 'xl' | '2xl';
  organizationBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}
