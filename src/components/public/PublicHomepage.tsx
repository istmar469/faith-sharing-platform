
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Settings, Play, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import LoginDialog from '@/components/auth/LoginDialog';
import { useAuthStatus } from '@/hooks/useAuthStatus';

interface PageData {
  id: string;
  title: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
}

const PublicHomepage: React.FC = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { organizationId, organizationName } = useTenantContext();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) {
        console.log('PublicHomepage: No organization ID available');
        setLoading(false);
        return;
      }

      try {
        console.log('PublicHomepage: Fetching homepage for org:', organizationId);
        
        // Use maybeSingle() instead of single() to handle cases where no homepage exists
        const { data: page, error } = await supabase
          .from('pages')
          .select('id, title, content, meta_title, meta_description')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error('PublicHomepage: Error fetching homepage:', error);
          // Don't throw, just log and continue with fallback
        } else if (page) {
          console.log('PublicHomepage: Found homepage:', page.title);
          setPageData(page);
        } else {
          console.log('PublicHomepage: No homepage found, using default content');
          // No homepage found, but that's okay - we'll show default content
        }

      } catch (err) {
        console.error('PublicHomepage: Exception fetching data:', err);
        // Continue with fallback content even if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const handleDashboardNavigation = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Bar for authenticated users */}
      {isAuthenticated && (
        <div className="bg-blue-600 text-white p-2 text-center text-sm">
          <span className="mr-4">You are logged in as church staff</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-blue-600"
            onClick={handleDashboardNavigation}
          >
            <Settings className="mr-1 h-3 w-3" />
            Go to Dashboard
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm relative">
        {!isAuthenticated && (
          <div className="absolute top-4 right-4 z-50">
            <Button 
              onClick={() => setLoginDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {organizationName || 'Welcome to Our Church'}
            </h1>
            <p className="text-xl text-gray-600">
              Join us as we grow in faith and community together
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Our Church Community</h2>
              <p className="text-xl mb-6">
                Experience the love of Christ in a welcoming community. 
                Join us for worship, fellowship, and spiritual growth.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Plan Your Visit
              </Button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Service Times</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-semibold">Sunday Worship</p>
                    <p className="text-blue-100">9:00 AM & 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-semibold">Wednesday Bible Study</p>
                    <p className="text-blue-100">7:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-blue-100">123 Church Street</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Church</h2>
            <p className="text-lg text-gray-600 mb-8">
              We are a community of believers committed to following Jesus Christ and sharing His love 
              with our neighbors. Our mission is to worship God, grow in faith, and serve others in 
              the name of Christ.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Worship</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Join us for inspiring worship services filled with music, prayer, and biblical teaching.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Community</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Build meaningful relationships through small groups, fellowship events, and service opportunities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Service</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Make a difference in our community through outreach programs and volunteer opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Us</h2>
            <p className="text-lg text-gray-600 mb-8">
              We'd love to welcome you to our church family. Come as you are!
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                <Phone className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">info@church.com</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Plan Your Visit
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
    </div>
  );
};

export default PublicHomepage;
