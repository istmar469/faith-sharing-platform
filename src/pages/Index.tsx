import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, FileText, Settings, ChevronRight } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';

const Index = () => {
  const navigate = useNavigate();
  
  const handleAuthClick = () => {
    navigate('/auth');
  };
  
  const handleDemoClick = (path: string) => {
    navigate(path);
  };
  
  if (showAuth) {
    return <AuthForm />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/80 to-primary-dark">
      <header className="fixed w-full bg-transparent z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white">
              <span className="text-accent">Church</span>OS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-accent hover:bg-white/10"
              onClick={() => handleAuthClick()}
            >
              Login
            </Button>
            <Button 
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={() => handleAuthClick()}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center text-white">
              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                Church Management Made <span className="text-accent">Simple</span>
              </h1>
              <p className="text-xl opacity-80 max-w-2xl mx-auto mb-8">
                A complete platform built for churches to manage their online presence, donations, content, and more in one centralized dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-accent text-primary hover:bg-accent/90 text-lg py-6 px-8"
                  onClick={() => handleAuthClick()}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 text-lg py-6 px-8"
                  onClick={() => handleDemoClick('/dashboard')}
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything your church needs in one platform</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our multi-tenant solution provides the tools churches need to grow their ministry online and in-person.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Custom Websites</h3>
                  <p className="text-gray-600">
                    Create and manage beautiful, responsive church websites with our intuitive drag-and-drop page builder.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/page-builder')}>
                    View Page Builder <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sermon Management</h3>
                  <p className="text-gray-600">
                    Upload, organize, and share sermon content, including videos, audio recordings, and notes.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/dashboard')}>
                    Explore Features <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Donation Management</h3>
                  <p className="text-gray-600">
                    Easily collect and manage online donations with integrated payment processing and reporting.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/dashboard')}>
                    View Demo <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live Streaming</h3>
                  <p className="text-gray-600">
                    Stream your services live on your website with integrations for YouTube, Facebook, and more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/dashboard')}>
                    Explore Features <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Community Tools</h3>
                  <p className="text-gray-600">
                    Foster connection with prayer requests, member directories, and group management features.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/dashboard')}>
                    View Demo <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Custom Domain</h3>
                  <p className="text-gray-600">
                    Connect your own domain or use a free church-os.com subdomain for your church website.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => handleDemoClick('/settings/custom-domain')}>
                    Explore Options <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the plan that best fits your church's needs and budget.
              </p>
            </div>
            
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-[400px] max-w-full grid-cols-2 mx-auto mb-8">
                <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                <TabsTrigger value="yearly">Yearly Billing (Save 20%)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="space-y-0">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Basic</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">Perfect for small churches getting started online.</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 1 Church Site
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Page Builder
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Sermon Manager
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Donation Forms
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-gray-300 mr-2" /> Custom Domain
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-gray-300 mr-2" /> Live Streaming
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full" onClick={() => handleAuthClick()}>Start with Basic</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-0 shadow-xl bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Premium</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$79</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">Best for growing churches needing more features.</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 1 Church Site
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Advanced Page Builder
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Sermon Manager
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Donation Forms
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Custom Domain
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Live Streaming
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Email Newsletter
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Priority Support
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full bg-accent text-primary hover:bg-accent/90" onClick={() => handleAuthClick()}>
                        Start with Premium
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$199</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">For larger churches with advanced needs.</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Multiple Church Sites
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> All Premium Features
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> API Access
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Member Directory
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Custom Integrations
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Dedicated Support
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full" onClick={() => handleAuthClick()}>Start with Enterprise</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="yearly" className="space-y-0">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Basic</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$23</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">Billed annually ($276/year)</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 1 Church Site
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Page Builder
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Sermon Manager
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Donation Forms
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-gray-300 mr-2" /> Custom Domain
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-gray-300 mr-2" /> Live Streaming
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full" onClick={() => handleAuthClick()}>Start with Basic</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-0 shadow-xl bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Premium</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$63</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">Billed annually ($756/year)</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 1 Church Site
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Advanced Page Builder
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Sermon Manager
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Donation Forms
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Custom Domain
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Live Streaming
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Email Newsletter
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Priority Support
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full bg-accent text-primary hover:bg-accent/90" onClick={() => handleAuthClick()}>
                        Start with Premium
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <div className="p-6 pb-2">
                      <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">$159</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">Billed annually ($1,908/year)</p>
                    </div>
                    <CardContent className="border-t border-b border-gray-100 bg-gray-50">
                      <ul className="space-y-3 py-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Multiple Church Sites
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> All Premium Features
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> API Access
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Member Directory
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Custom Integrations
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Dedicated Support
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                      <Button className="w-full" onClick={() => handleAuthClick()}>Start with Enterprise</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your church's online presence?</h2>
            <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
              Join thousands of churches using Church-OS to manage their websites, sermons, donations, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-accent text-primary hover:bg-accent/90 text-lg py-6 px-8"
                onClick={() => handleAuthClick()}
              >
                Get Started Today
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg py-6 px-8"
                onClick={() => handleDemoClick('/dashboard')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white px-4 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Church-OS</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Templates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">GDPR</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Instagram</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 Church-OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Import necessary icons
function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Video(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

export default Index;
