
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Layout, Download } from 'lucide-react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PuckData } from '../context/pageBuilderTypes';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  content: PuckData;
}

const TemplatesSidebar: React.FC = () => {
  const { 
    setPageElements,
    setPageTitle,
    pageElements,
    pageTitle
  } = usePageBuilder();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Templates using Puck format
  const templates: Template[] = [
    {
      id: 'church-home',
      name: 'Church Homepage',
      description: 'Beautiful homepage template for churches with hero section, services, and contact info',
      category: 'homepage',
      preview: '/placeholder.svg',
      content: {
        content: [
          {
            type: 'Hero',
            props: {
              title: 'Welcome to Our Church',
              subtitle: 'Join us for worship every Sunday at 9:00 AM and 11:00 AM'
            }
          },
          {
            type: 'ServiceTimes',
            props: {
              title: 'Service Times',
              services: [
                { name: 'Sunday Morning', time: '9:00 AM' },
                { name: 'Sunday Evening', time: '11:00 AM' }
              ]
            }
          },
          {
            type: 'ContactInfo',
            props: {
              address: '123 Church Street, Your City, State 12345',
              phone: '(555) 123-4567',
              email: 'info@ourchurch.org'
            }
          }
        ],
        root: {
          title: 'Church Homepage'
        }
      }
    },
    {
      id: 'about-us',
      name: 'About Us Page',
      description: 'Tell your church story with this comprehensive about page template',
      category: 'content',
      preview: '/placeholder.svg',
      content: {
        content: [
          {
            type: 'Hero',
            props: {
              title: 'About Our Church',
              subtitle: 'Learn about our mission, history, and values'
            }
          },
          {
            type: 'TextBlock',
            props: {
              title: 'Our Mission',
              text: 'We are called to love God with all our heart, soul, mind, and strength, and to love our neighbors as ourselves. Our mission is to create a welcoming community where people can grow in their relationship with Jesus Christ and serve others.'
            }
          },
          {
            type: 'TextBlock',
            props: {
              title: 'Our History',
              text: 'Founded in 1985, our church has been serving the community for over 35 years. What started as a small gathering of believers has grown into a vibrant community of faith that reaches across generations and backgrounds.'
            }
          }
        ],
        root: {
          title: 'About Us'
        }
      }
    },
    {
      id: 'events-page',
      name: 'Events & Calendar',
      description: 'Showcase upcoming events and church calendar',
      category: 'events',
      preview: '/placeholder.svg',
      content: {
        content: [
          {
            type: 'Hero',
            props: {
              title: 'Upcoming Events',
              subtitle: 'Join us for these exciting upcoming events!'
            }
          },
          {
            type: 'EventCalendar',
            props: {
              title: 'Church Calendar',
              events: [
                { name: 'Sunday Service', date: '2024-01-07', time: '9:00 AM' },
                { name: 'Bible Study', date: '2024-01-10', time: '7:00 PM' }
              ]
            }
          }
        ],
        root: {
          title: 'Events'
        }
      }
    },
    {
      id: 'contact-page',
      name: 'Contact Us',
      description: 'Contact form and church information page',
      category: 'contact',
      preview: '/placeholder.svg',
      content: {
        content: [
          {
            type: 'Hero',
            props: {
              title: 'Contact Us',
              subtitle: 'We would love to hear from you!'
            }
          },
          {
            type: 'ContactInfo',
            props: {
              address: '123 Church Street, Your City, State 12345',
              phone: '(555) 123-4567',
              email: 'info@ourchurch.org'
            }
          },
          {
            type: 'ContactForm',
            props: {
              title: 'Send us a message',
              description: 'Fill out the form below and we\'ll get back to you soon.'
            }
          }
        ],
        root: {
          title: 'Contact Us'
        }
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'homepage', name: 'Homepage' },
    { id: 'content', name: 'Content Pages' },
    { id: 'events', name: 'Events' },
    { id: 'contact', name: 'Contact' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApplyTemplate = (template: Template) => {
    // Set the Puck content directly
    setPageElements(template.content);
    
    // Update page title if it's a new page
    if (!pageTitle || pageTitle === 'New Page') {
      setPageTitle(template.name);
    }
    
    toast.success(`Applied template: ${template.name}`);
  };

  const handleCreateFromTemplate = (template: Template) => {
    // This creates a new page with the template content
    setPageElements(template.content);
    setPageTitle(template.name);
    
    toast.success(`Created new page from template: ${template.name}`);
  };

  // Helper function to check if content exists
  const hasContent = () => {
    if (!pageElements) return false;
    
    // Handle Puck format
    if (typeof pageElements === 'object' && pageElements.content) {
      return Array.isArray(pageElements.content) && pageElements.content.length > 0;
    }
    
    return false;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-4">Templates</h3>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Layout className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                <p className="text-xs text-gray-500">{template.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  {hasContent() ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apply Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace your current page content with the "{template.name}" template. 
                            Any unsaved changes will be lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleApplyTemplate(template)}>
                            Apply Template
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  )}
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TemplatesSidebar;
