
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import PublicHomepage from '@/components/public/PublicHomepage';
import FloatingAdminButton from '@/components/admin/FloatingAdminButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Settings, LogIn, X, Plus, Church, Users, Globe, BarChart3, Calendar, MessageSquare, Zap, CheckCircle, ArrowRight, Play } from 'lucide-react';
import LoginDialog from '@/components/auth/LoginDialog';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

const Index = () => {
  const { isSubdomainAccess, organizationName, organizationId, isContextReady } = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [adminBarDismissed, setAdminBarDismissed] = useState(() => {
    return localStorage.getItem('adminBarDismissed') === 'true';
  });

  // Add debug logging for state tracking
  useEffect(() => {
    console.log('Index: State update', {
      isSubdomainAccess,
      isContextReady,
      isAuthenticated,
      isCheckingAuth,
      adminBarDismissed,
      organizationId,
      hostname: window.location.hostname
    });
  }, [isSubdomainAccess, isContextReady, isAuthenticated, isCheckingAuth, adminBarDismissed, organizationId]);

  useEffect(() => {
    const fetchHomepage = async () => {
      // Only fetch homepage data for subdomains
      if (!isSubdomainAccess || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Index: Fetching homepage for subdomain org:', organizationId);
        
        const { data: page, error } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error('Index: Error fetching homepage:', error);
        } else if (page) {
          console.log('Index: Found homepage:', page.title);
          setHomepageData(page);
        } else {
          console.log('Index: No published homepage found for subdomain');
        }
      } catch (err) {
        console.error('Index: Exception fetching homepage:', err);
      } finally {
        setLoading(false);
      }
    };

    // Wait for context to be ready before proceeding
    if (isContextReady) {
      fetchHomepage();
    }
  }, [organizationId, isSubdomainAccess, isContextReady]);

  const handleDismissAdminBar = () => {
    setAdminBarDismissed(true);
    localStorage.setItem('adminBarDismissed', 'true');
  };

  const handleShowAdminBar = () => {
    setAdminBarDismissed(false);
    localStorage.setItem('adminBarDismissed', 'false');
  };

  // Keyboard shortcut to toggle admin bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (isAuthenticated) {
          setAdminBarDismissed(!adminBarDismissed);
          localStorage.setItem('adminBarDismissed', (!adminBarDismissed).toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, adminBarDismissed]);

  // Show loading until all states are ready
  if (!isContextReady || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For root domain - show the modern Church OS landing page
  if (!isSubdomainAccess) {
    const features = [
      {
        icon: Church,
        title: "Website Builder",
        description: "Create beautiful church websites with our visual page builder - no coding required."
      },
      {
        icon: Users,
        title: "Member Management",
        description: "Manage your congregation, track attendance, and organize groups seamlessly."
      },
      {
        icon: Calendar,
        title: "Event Management",
        description: "Schedule services, events, and activities with automated reminders."
      },
      {
        icon: MessageSquare,
        title: "Communication",
        description: "Send newsletters, announcements, and stay connected with your community."
      },
      {
        icon: BarChart3,
        title: "Analytics",
        description: "Track engagement, growth, and measure the impact of your ministry."
      },
      {
        icon: Globe,
        title: "Multi-Platform",
        description: "Reach your community across web, mobile, and social media platforms."
      }
    ];

    const benefits = [
      "Visual drag-and-drop page builder",
      "Mobile-responsive design",
      "SEO optimization tools",
      "Custom domain support",
      "Secure member portal",
      "Automated backups"
    ];

    return (
      <div className="min-h-screen bg-white">
        {/* Admin bar for authenticated users on root domain */}
        {isAuthenticated && !adminBarDismissed && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
              <div className="flex items-center gap-2">
                <OrgAwareLink to="/dashboard">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Dashboard
                  </Button>
                </OrgAwareLink>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissAdminBar}
                  className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating admin button when bar is dismissed */}
        {isAuthenticated && adminBarDismissed && (
          <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}`}>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                    Modern Church
                    <span className="block text-blue-200">Management</span>
                  </h1>
                  <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                    Build beautiful websites, manage your congregation, and grow your ministry with our all-in-one platform designed specifically for churches.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                      onClick={() => setShowLoginDialog(true)}
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Get Started Free
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Church className="h-8 w-8 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">Your Church</h3>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Everything Your Church Needs
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From beautiful websites to powerful management tools, Church OS provides everything you need to strengthen your ministry and connect with your community.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                    Built for Churches, By Church Leaders
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    We understand the unique challenges churches face. Our platform is designed with real church needs in mind, making it easy to manage your ministry and focus on what matters most.
                  </p>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Members</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">1,247</div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold">Events</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">23</div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Transform Your Ministry?
              </h2>
              <p className="text-xl mb-12 text-blue-100">
                Join thousands of churches already using Church OS to build stronger communities and grow their ministry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <OrgAwareLink to="/page-builder">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Try Page Builder
                  </Button>
                </OrgAwareLink>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Church className="h-8 w-8 text-blue-400" />
                    <h3 className="text-2xl font-bold">Church OS</h3>
                  </div>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Empowering churches worldwide with modern technology to build stronger communities and grow their ministry.
                  </p>
                  <div className="flex gap-4">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Support
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Documentation
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Features</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Website Builder</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Member Management</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Event Planning</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Communication</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Church OS. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  // For subdomains - handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For subdomains with published homepage - show Puck content
  if (homepageData) {
    return (
      <div className="min-h-screen bg-white">
        {/* Admin overlay for authenticated users on subdomains */}
        {isAuthenticated && !adminBarDismissed && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
              <div className="flex items-center gap-2">
                <OrgAwareLink to={`/page-builder/${homepageData.id}`}>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit Site
                  </Button>
                </OrgAwareLink>
                <OrgAwareLink to="/dashboard">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1 h-8"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Dashboard
                  </Button>
                </OrgAwareLink>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissAdminBar}
                  className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating admin button when bar is dismissed */}
        {isAuthenticated && adminBarDismissed && (
          <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        {/* Render the Puck homepage content */}
        <div className={`min-h-screen ${isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}`}>
          <PuckRenderer 
            data={homepageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  // For subdomains without published homepage - show PublicHomepage with admin overlay
  return (
    <div className="min-h-screen bg-white relative">
      {/* Admin overlay for authenticated users on subdomains without homepage */}
      {isAuthenticated && !adminBarDismissed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
            <div className="flex items-center gap-2">
              <OrgAwareLink to="/page-builder">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Create Homepage
                </Button>
              </OrgAwareLink>
              <OrgAwareLink to="/dashboard">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1 h-8"
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Dashboard
                </Button>
              </OrgAwareLink>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissAdminBar}
                className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating admin button when bar is dismissed */}
      {isAuthenticated && adminBarDismissed && (
        <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
      )}

      {/* PublicHomepage component with admin bar offset */}
      <div className={isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}>
        <PublicHomepage />
      </div>

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default Index;
