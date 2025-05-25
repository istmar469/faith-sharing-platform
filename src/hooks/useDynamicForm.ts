
import { useState, useEffect } from 'react';
import { ContactFormField } from '@/services/contactFormService';

interface UseDynamicFormProps {
  fields: ContactFormField[];
  initialData?: Record<string, any>;
}

export const useDynamicForm = ({ fields, initialData = {} }: UseDynamicFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('useDynamicForm: Hook initialized', {
      fieldsCount: fields.length,
      initialDataKeys: Object.keys(initialData),
      fieldNames: fields.map(f => f.field_name)
    });
  }, [fields, initialData]);

  useEffect(() => {
    console.log('useDynamicForm: Initial data changed', { initialData });
    setFormData(initialData);
  }, [initialData]);

  const setValue = (fieldName: string, value: any) => {
    console.log('useDynamicForm: Setting value', { fieldName, value });
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field: ContactFormField): string | null => {
    const value = formData[field.field_name];
    
    console.log('useDynamicForm: Validating field', {
      fieldName: field.field_name,
      fieldType: field.field_type,
      isRequired: field.is_required,
      value,
      hasValue: !!value
    });
    
    // Check required fields
    if (field.is_required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }

    // Email validation
    if (field.field_type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.field_type === 'phone' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }

    // Custom validation rules
    if (field.validation_rules && typeof field.validation_rules === 'object') {
      const rules = field.validation_rules as Record<string, any>;
      
      if (rules.minLength && value && value.length < rules.minLength) {
        return `${field.label} must be at least ${rules.minLength} characters`;
      }
      
      if (rules.maxLength && value && value.length > rules.maxLength) {
        return `${field.label} must be no more than ${rules.maxLength} characters`;
      }
      
      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        return rules.message || `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    console.log('useDynamicForm: Validating entire form', {
      fieldsCount: fields.length,
      formDataKeys: Object.keys(formData)
    });
    
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field.field_name] = error;
      }
    });

    console.log('useDynamicForm: Validation complete', {
      errorCount: Object.keys(newErrors).length,
      errors: newErrors
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    console.log('useDynamicForm: Resetting form');
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  const getFieldValue = (fieldName: string): any => {
    return formData[fieldName];
  };

  return {
    formData,
    errors,
    isDirty,
    setValue,
    validateForm,
    validateField,
    reset,
    getFieldError,
    getFieldValue,
  };
};
