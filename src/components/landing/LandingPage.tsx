import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, LogIn, Church, Users, Calendar, MessageSquare, BarChart3, Globe, Zap, CheckCircle, ArrowRight, Play, Building2, Crown, Star, Shield, Smartphone, Heart } from 'lucide-react';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import LandingNavigation from './LandingNavigation';
import SubscriptionFlow from './SubscriptionFlow';
import { useAuthContext } from '@/components/auth/AuthContext';
import { getCurrentDomain } from '@/utils/domain';

interface LandingPageProps {
  onShowLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin }) => {
  const { user } = useAuthContext();
  const [showSubscriptionFlow, setShowSubscriptionFlow] = useState(false);
  const [preselectedTier, setPreselectedTier] = useState<string>('basic');
  const currentDomain = getCurrentDomain();

  const handleStartSubscription = (tier: string = 'basic') => {
    setPreselectedTier(tier);
    setShowSubscriptionFlow(true);
  };

  const features = [
    {
      icon: Church,
      title: "Website Builder",
      description: "Create stunning church websites with our intuitive drag-and-drop builder. No coding required.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Effortlessly manage your congregation, track attendance, and organize small groups.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Schedule services, events, and activities with automated reminders and RSVP tracking.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Send newsletters, announcements, and prayer requests to stay connected with your community.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track engagement, growth metrics, and measure the impact of your ministry efforts.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Heart,
      title: "Donation Management",
      description: "Accept online donations securely with built-in giving tools and financial reporting.",
      color: "bg-red-100 text-red-600"
    }
  ];

  const benefits = [
    "Professional responsive design templates",
    "SEO optimization for better search visibility",
    "Mobile-first design for all devices",
    "SSL certificates and secure hosting",
    "Automated backups and data protection",
    "24/7 customer support and training"
  ];

  const testimonials = [
    {
      name: "Pastor John Smith",
      church: "Grace Community Church",
      quote: "Church OS transformed how we connect with our congregation. Our online engagement increased by 300%!",
      rating: 5
    },
    {
      name: "Sarah Williams",
      church: "New Hope Fellowship",
      quote: "The website builder is incredibly intuitive. We had our site up and running in just one afternoon.",
      rating: 5
    },
    {
      name: "Rev. Michael Brown",
      church: "Faith Baptist Church",
      quote: "The member management tools have streamlined our operations. It's like having a digital assistant!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <LandingNavigation onShowLogin={onShowLogin} />
      
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2 text-yellow-300" />
                Trusted by 1000+ Churches Worldwide
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Your Dream
                <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Church Website
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed max-w-2xl">
                Empower your ministry with a complete digital platform. Create beautiful websites, manage your congregation, and grow your community—all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-8 py-4 text-lg shadow-xl"
                  onClick={() => handleStartSubscription('basic')}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Today
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent font-semibold px-8 py-4 text-lg"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  {/* Browser mockup */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Church className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">Your Church Name</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  {/* Website preview */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-24 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
                      <div className="text-center">
                        <Building2 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-blue-600 text-sm font-medium">Your Beautiful Website</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                <Users className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Ministry Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From stunning websites to comprehensive member management, our platform provides all the tools you need to grow and nurture your church community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">
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

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              Customer Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by Church Leaders Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how churches around the world are transforming their ministries with Church OS.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.church}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-6">
              <Crown className="h-4 w-4 mr-2" />
              Transparent Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Plans That Grow With Your Ministry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your church's needs. Start free and upgrade as your community grows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Basic</CardTitle>
                <p className="text-gray-600 mb-6">Perfect for small churches getting started</p>
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2 text-lg">forever</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {[
                    "Professional website builder",
                    "Up to 100 members",
                    "5GB storage",
                    "Custom subdomain",
                    "Mobile-responsive templates",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg shadow-lg"
                  onClick={() => handleStartSubscription('basic')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Standard Plan - Featured */}
            <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-3 scale-105 bg-white border-2 border-purple-500">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Standard</CardTitle>
                <p className="text-gray-600 mb-6">Ideal for growing churches</p>
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600 ml-2 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Basic",
                    "Up to 500 members", 
                    "50GB storage",
                    "Custom domain included",
                    "Premium templates",
                    "Event management",
                    "Online donations",
                    "Priority support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg shadow-lg"
                  onClick={() => handleStartSubscription('standard')}
                >
                  Start 14-Day Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-10 w-10 text-amber-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Premium</CardTitle>
                <p className="text-gray-600 mb-6">For large churches and multi-site organizations</p>
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600 ml-2 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Standard",
                    "Unlimited members",
                    "500GB storage",
                    "Multiple custom domains",
                    "White-label branding",
                    "Advanced analytics",
                    "Multi-site management",
                    "Dedicated support manager",
                    "API access & integrations"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 text-lg shadow-lg"
                  onClick={() => handleStartSubscription('premium')}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Footer */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">14-day free trial on all plans</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700 font-medium">No setup fees or hidden costs</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <span className="text-gray-700 font-medium">Cancel anytime, no questions asked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
                <Shield className="h-4 w-4 mr-2" />
                Why Choose Church OS
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                Built for Churches,
                <span className="block text-blue-600">By Church Leaders</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We understand the unique challenges churches face in today's digital world. Our platform is designed with real church needs in mind, making it easy to manage your ministry and focus on what matters most—your community.
              </p>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 shadow-lg"
                onClick={() => handleStartSubscription('standard')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 text-center border-0 shadow-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
                    <div className="text-gray-600 text-sm">Active Members</div>
                  </Card>
                  <Card className="p-6 text-center border-0 shadow-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">23</div>
                    <div className="text-gray-600 text-sm">Monthly Events</div>
                  </Card>
                  <Card className="p-6 text-center border-0 shadow-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
                    <div className="text-gray-600 text-sm">Uptime</div>
                  </Card>
                  <Card className="p-6 text-center border-0 shadow-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$12K</div>
                    <div className="text-gray-600 text-sm">Monthly Donations</div>
                  </Card>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Join 1000+ Churches Already Growing
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Ready to Transform
            <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Your Ministry?
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Join thousands of churches already using Church OS to build stronger communities, increase engagement, and grow their ministry impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-10 py-5 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
              onClick={() => handleStartSubscription('standard')}
            >
              Start Your Free Trial
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent font-semibold px-10 py-5 text-xl"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View All Plans
              <Crown className="ml-3 h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Setup in under 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>No technical knowledge required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Full support & training included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Church className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">Church OS</h3>
              </div>
              <p className="text-gray-400 mb-8 max-w-md text-lg leading-relaxed">
                Empowering churches worldwide with modern technology to build stronger communities, increase engagement, and grow their ministry impact.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500">
                  Get Support
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500">
                  Documentation
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Website Builder</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Member Management</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Event Planning</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Communication Tools</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">&copy; 2024 Church OS. All rights reserved.</p>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>Made with ❤️ for churches worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Subscription Flow Modal */}
      <SubscriptionFlow
        isOpen={showSubscriptionFlow}
        onClose={() => setShowSubscriptionFlow(false)}
        preselectedTier={preselectedTier}
      />
    </div>
  );
};

export default LandingPage;
