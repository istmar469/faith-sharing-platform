
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

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  elements: any[];
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

  // Sample templates - in a real app, these would come from an API
  const templates: Template[] = [
    {
      id: 'church-home',
      name: 'Church Homepage',
      description: 'Beautiful homepage template for churches with hero section, services, and contact info',
      category: 'homepage',
      preview: '/placeholder.svg',
      elements: [
        {
          id: '1',
          type: 'section',
          component: 'Section',
          props: {
            className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20',
            children: 'Hero Section'
          }
        },
        {
          id: '2',
          type: 'heading',
          component: 'Heading',
          props: {
            level: 1,
            children: 'Welcome to Our Church',
            className: 'text-center text-4xl font-bold mb-4'
          }
        }
      ]
    },
    {
      id: 'about-us',
      name: 'About Us Page',
      description: 'Tell your church story with this comprehensive about page template',
      category: 'content',
      preview: '/placeholder.svg',
      elements: [
        {
          id: '1',
          type: 'heading',
          component: 'Heading',
          props: {
            level: 1,
            children: 'About Our Church',
            className: 'text-3xl font-bold mb-6'
          }
        },
        {
          id: '2',
          type: 'paragraph',
          component: 'Paragraph',
          props: {
            children: 'Learn about our mission, vision, and values.',
            className: 'text-lg text-gray-600 mb-4'
          }
        }
      ]
    },
    {
      id: 'events-page',
      name: 'Events & Calendar',
      description: 'Showcase upcoming events and church calendar',
      category: 'events',
      preview: '/placeholder.svg',
      elements: [
        {
          id: '1',
          type: 'heading',
          component: 'Heading',
          props: {
            level: 1,
            children: 'Upcoming Events',
            className: 'text-3xl font-bold mb-6'
          }
        },
        {
          id: '2',
          type: 'events',
          component: 'EventsCalendar',
          props: {
            className: 'w-full'
          }
        }
      ]
    },
    {
      id: 'contact-page',
      name: 'Contact Us',
      description: 'Contact form and church information page',
      category: 'contact',
      preview: '/placeholder.svg',
      elements: [
        {
          id: '1',
          type: 'heading',
          component: 'Heading',
          props: {
            level: 1,
            children: 'Contact Us',
            className: 'text-3xl font-bold mb-6'
          }
        },
        {
          id: '2',
          type: 'paragraph',
          component: 'Paragraph',
          props: {
            children: 'We would love to hear from you. Get in touch with us today.',
            className: 'text-lg text-gray-600 mb-8'
          }
        }
      ]
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
    // Generate unique IDs for template elements
    const elementsWithNewIds = template.elements.map(element => ({
      ...element,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setPageElements(elementsWithNewIds);
    
    // Update page title if it's a new page
    if (!pageTitle || pageTitle === 'New Page') {
      setPageTitle(template.name);
    }
    
    toast.success(`Applied template: ${template.name}`);
  };

  const handleCreateFromTemplate = (template: Template) => {
    // This would create a new page with the template
    const elementsWithNewIds = template.elements.map(element => ({
      ...element,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setPageElements(elementsWithNewIds);
    setPageTitle(template.name);
    
    toast.success(`Created new page from template: ${template.name}`);
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
                  {pageElements.length > 0 ? (
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
