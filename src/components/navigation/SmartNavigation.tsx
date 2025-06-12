import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getDynamicNavigation, NavigationItem } from '@/services/navigationService';

interface SmartNavigationProps {
  organizationId: string;
  siteTitle?: string;
  logoUrl?: string;
  showSearch?: boolean;
  showUserMenu?: boolean;
  backgroundColor?: string;
  textColor?: string;
  user?: any;
  onDashboard?: () => void;
}

const SmartNavigation: React.FC<SmartNavigationProps> = ({
  organizationId,
  siteTitle = 'Your Site',
  logoUrl,
  showSearch = false,
  showUserMenu = true,
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  user,
  onDashboard
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    loadNavigation();
  }, [organizationId]);

  const loadNavigation = async () => {
    try {
      setLoading(true);
      const result = await getDynamicNavigation(organizationId);
      if (result.success) {
        setNavigationItems(result.data);
      } else {
        console.error('Failed to load navigation:', result.error);
      }
    } catch (error) {
      console.error('Error loading navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (url: string, target: string, isExternal?: boolean) => {
    if (isExternal || target === '_blank') {
      window.open(url, '_blank');
    } else {
      // Close mobile menu
      setMobileMenuOpen(false);
      // Let React Router handle internal navigation
    }
  };

  const isActiveLink = (url: string) => {
    if (url === '/') {
      return location.pathname === '/';
    }
    return location.pathname === url;
  };

  const headerStyle = {
    backgroundColor,
    color: textColor,
    borderColor: `${textColor}20`
  };

  const linkStyle = {
    color: textColor
  };

  if (loading) {
    return (
      <header className="border-b shadow-sm sticky top-0 z-50" style={headerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="hidden md:flex space-x-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b shadow-sm sticky top-0 z-50" style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-75 transition-opacity">
              {logoUrl ? (
                <>
                  <img 
                    src={logoUrl} 
                    alt={siteTitle} 
                    className="h-8 w-auto mr-3"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xl font-bold" style={linkStyle}>
                    {siteTitle}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold" style={linkStyle}>
                  {siteTitle}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                target={item.target}
                onClick={() => handleLinkClick(item.url, item.target, item.isExternal)}
                className={`hover:opacity-75 transition-all font-medium relative ${
                  isActiveLink(item.url) 
                    ? 'after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-current' 
                    : ''
                }`}
                style={linkStyle}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {showSearch && (
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  style={{ borderColor: `${textColor}30` }}
                />
              </div>
            )}

            {/* User Menu */}
            {showUserMenu && (
              <div className="hidden md:flex">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" style={{ color: textColor }}>
                        <User className="h-4 w-4 mr-2" />
                        {user.email?.split('@')[0] || 'User'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onDashboard && (
                        <DropdownMenuItem onClick={onDashboard}>
                          Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => window.location.href = '/auth/logout'}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="sm" style={{ color: textColor }}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: textColor }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: `${textColor}20` }}>
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  target={item.target}
                  onClick={() => handleLinkClick(item.url, item.target, item.isExternal)}
                  className={`block py-3 px-1 hover:opacity-75 transition-all font-medium border-l-4 ${
                    isActiveLink(item.url) 
                      ? 'border-current bg-black bg-opacity-5' 
                      : 'border-transparent'
                  }`}
                  style={linkStyle}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Search */}
              {showSearch && (
                <div className="px-1 pt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                      style={{ borderColor: `${textColor}30` }}
                    />
                  </div>
                </div>
              )}

              {/* Mobile User Actions */}
              {showUserMenu && (
                <div className="border-t pt-4" style={{ borderColor: `${textColor}20` }}>
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-1 py-2 text-sm font-medium" style={linkStyle}>
                        {user.email}
                      </div>
                      {onDashboard && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onDashboard();
                          }}
                          className="block w-full text-left py-2 px-1 hover:opacity-75 transition-opacity"
                          style={linkStyle}
                        >
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => window.location.href = '/auth/logout'}
                        className="block w-full text-left py-2 px-1 hover:opacity-75 transition-opacity"
                        style={linkStyle}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left py-2 px-1 hover:opacity-75 transition-opacity"
                      style={linkStyle}
                    >
                      <LogIn className="h-4 w-4 mr-2 inline" />
                      Login
                    </button>
                  )}
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default SmartNavigation; 