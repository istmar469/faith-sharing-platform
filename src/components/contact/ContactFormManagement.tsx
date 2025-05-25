
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Settings, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import { useContactForms } from '@/hooks/useContactForms';
import { ContactForm } from '@/services/contactFormService';
import ContactFormBuilder from './ContactFormBuilder';
import ContactFormSubmissions from './ContactFormSubmissions';

const ContactFormManagement: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { forms, loading, refetch, deleteForm } = useContactForms(organizationId);
  const { toast } = useToast();
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<ContactForm | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const handleCreateForm = () => {
    setEditingForm(null);
    setShowBuilder(true);
  };

  const handleEditForm = (form: ContactForm) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this contact form? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteForm(formId);
      toast({
        title: 'Success',
        description: 'Contact form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewSubmissions = (formId: string) => {
    setSelectedFormId(formId);
    setShowSubmissions(true);
  };

  const handleFormSaved = () => {
    setShowBuilder(false);
    setEditingForm(null);
    refetch();
  };

  if (showBuilder) {
    return (
      <ContactFormBuilder
        form={editingForm || undefined}
        onSave={handleFormSaved}
        onCancel={() => {
          setShowBuilder(false);
          setEditingForm(null);
        }}
      />
    );
  }

  if (showSubmissions && selectedFormId) {
    return (
      <ContactFormSubmissions
        formId={selectedFormId}
        onBack={() => {
          setShowSubmissions(false);
          setSelectedFormId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Forms</h2>
        <Button onClick={handleCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading contact forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No contact forms</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first contact form.</p>
            <Button onClick={handleCreateForm} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {form.name}
                      <Badge variant={form.is_active ? 'default' : 'secondary'}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    {form.description && (
                      <p className="text-gray-600 mt-1">{form.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Slug:</span> /{form.slug}
                  </div>
                  <div>
                    <span className="font-medium">Email Notifications:</span>{' '}
                    {form.email_notifications ? 'Enabled' : 'Disabled'}
                  </div>
                  <div>
                    <span className="font-medium">Auto-responder:</span>{' '}
                    {form.auto_responder ? 'Enabled' : 'Disabled'}
                  </div>
                  <div>
                    <span className="font-medium">File Uploads:</span>{' '}
                    {form.allow_file_uploads ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSubmissions(form.id!)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Submissions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditForm(form)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteForm(form.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactFormManagement;
