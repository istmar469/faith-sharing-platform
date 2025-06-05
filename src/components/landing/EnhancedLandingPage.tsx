
import React, { useState } from 'react';
import { ArrowRight, Check, Star, Users, Globe, Palette, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SignupWithSubscription from '@/components/auth/SignupWithSubscription';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

interface EnhancedLandingPageProps {
  onShowLogin?: () => void;
}

const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onShowLogin }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  if (showSignup) {
    return <SignupWithSubscription onBack={() => setShowSignup(false)} />;
  }

  const features = [
    {
      icon: Palette,
      title: 'Visual Page Builder',
      description: 'Create beautiful pages with our drag-and-drop builder designed specifically for churches.'
    },
    {
      icon: Users,
      title: 'Member Management',
      description: 'Manage your congregation with built-in member directories and communication tools.'
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain name to create a professional web presence for your church.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime to keep your church website always available.'
    }
  ];

  const testimonials = [
    {
      quote: "Church OS transformed how we connect with our community. The page builder made it easy to create a beautiful website without any technical knowledge.",
      author: "Pastor Michael Johnson",
      church: "Grace Community Church",
      location: "Austin, TX"
    },
    {
      quote: "The subscription plans are perfect for our growing church. We started with Basic and upgraded as our needs expanded.",
      author: "Sarah Williams",
      church: "New Hope Fellowship",
      location: "Denver, CO"
    },
    {
      quote: "Managing our church website has never been easier. The tools are intuitive and the support team is amazing.",
      author: "Rev. David Chen",
      church: "Faith Lutheran Church",
      location: "Seattle, WA"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Church OS</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onShowLogin}>
                Sign In
              </Button>
              <Button onClick={() => setShowSignup(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Build Your Church's
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Digital Home
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Create beautiful websites, manage your congregation, and grow your ministry with Church OS - 
            the complete platform designed specifically for churches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              onClick={() => setShowSignup(true)}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setShowPlans(true)}
            >
              View Pricing
            </Button>
          </div>
          <p className="text-blue-100 mt-4">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From website building to member management, Church OS provides all the tools 
              you need to grow your ministry and connect with your community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {showPlans && (
        <section className="py-20" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start with our free plan and upgrade as your church grows.
              </p>
            </div>
            
            <SubscriptionPlans
              onSelectPlan={(tierName) => {
                setShowSignup(true);
              }}
              showToggle={true}
            />
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Churches Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what church leaders are saying about Church OS
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600">{testimonial.church}</div>
                    <div className="text-gray-500 text-sm">{testimonial.location}</div>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Church's Online Presence?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of churches already using Church OS to build stronger communities 
            and grow their ministry online.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            onClick={() => setShowSignup(true)}
          >
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-blue-100 mt-4">
            14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Church OS</h3>
            <p className="text-gray-400 mb-8">
              Empowering churches to build stronger communities through technology.
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 Church OS. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;
