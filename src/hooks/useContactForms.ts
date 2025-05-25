
import { useState, useEffect } from 'react';
import { 
  ContactForm, 
  ContactFormField, 
  ContactFormSubmission,
  getOrganizationContactForms,
  getContactFormFields,
  getOrganizationSubmissions,
  createContactForm,
  updateContactForm,
  deleteContactForm,
  createContactFormField,
  updateContactFormField,
  deleteContactFormField
} from '@/services/contactFormService';

interface UseContactFormsReturn {
  forms: ContactForm[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createForm: (form: ContactForm) => Promise<ContactForm>;
  updateForm: (id: string, updates: Partial<ContactForm>) => Promise<ContactForm>;
  deleteForm: (id: string) => Promise<boolean>;
}

export const useContactForms = (organizationId?: string): UseContactFormsReturn => {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    if (!organizationId) {
      setForms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedForms = await getOrganizationContactForms(organizationId);
      setForms(fetchedForms);
    } catch (err) {
      console.error('Error fetching contact forms:', err);
      setError('Failed to load contact forms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (form: ContactForm): Promise<ContactForm> => {
    const newForm = await createContactForm(form);
    await fetchForms();
    return newForm;
  };

  const handleUpdateForm = async (id: string, updates: Partial<ContactForm>): Promise<ContactForm> => {
    const updatedForm = await updateContactForm(id, updates);
    await fetchForms();
    return updatedForm;
  };

  const handleDeleteForm = async (id: string): Promise<boolean> => {
    const result = await deleteContactForm(id);
    await fetchForms();
    return result;
  };

  useEffect(() => {
    fetchForms();
  }, [organizationId]);

  return { 
    forms, 
    loading, 
    error, 
    refetch: fetchForms,
    createForm: handleCreateForm,
    updateForm: handleUpdateForm,
    deleteForm: handleDeleteForm
  };
};

interface UseContactFormFieldsReturn {
  fields: ContactFormField[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createField: (field: ContactFormField) => Promise<ContactFormField>;
  updateField: (id: string, updates: Partial<ContactFormField>) => Promise<ContactFormField>;
  deleteField: (id: string) => Promise<boolean>;
}

export const useContactFormFields = (formId?: string): UseContactFormFieldsReturn => {
  const [fields, setFields] = useState<ContactFormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = async () => {
    if (!formId) {
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedFields = await getContactFormFields(formId);
      setFields(fetchedFields);
    } catch (err) {
      console.error('Error fetching contact form fields:', err);
      setError('Failed to load contact form fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (field: ContactFormField): Promise<ContactFormField> => {
    const newField = await createContactFormField(field);
    await fetchFields();
    return newField;
  };

  const handleUpdateField = async (id: string, updates: Partial<ContactFormField>): Promise<ContactFormField> => {
    const updatedField = await updateContactFormField(id, updates);
    await fetchFields();
    return updatedField;
  };

  const handleDeleteField = async (id: string): Promise<boolean> => {
    const result = await deleteContactFormField(id);
    await fetchFields();
    return result;
  };

  useEffect(() => {
    fetchFields();
  }, [formId]);

  return { 
    fields, 
    loading, 
    error, 
    refetch: fetchFields,
    createField: handleCreateField,
    updateField: handleUpdateField,
    deleteField: handleDeleteField
  };
};

interface UseContactFormSubmissionsReturn {
  submissions: ContactFormSubmission[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useContactFormSubmissions = (organizationId?: string): UseContactFormSubmissionsReturn => {
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!organizationId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedSubmissions = await getOrganizationSubmissions(organizationId);
      setSubmissions(fetchedSubmissions);
    } catch (err) {
      console.error('Error fetching contact form submissions:', err);
      setError('Failed to load contact form submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [organizationId]);

  return { submissions, loading, error, refetch: fetchSubmissions };
};
