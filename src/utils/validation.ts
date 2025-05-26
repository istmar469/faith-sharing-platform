
// Validation utilities for form fields
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }
  
  if (digits.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits' };
  }
  
  return { isValid: true };
};

export const validateOrganizationName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'Organization name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Organization name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Organization name cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

export const validatePastorName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: true }; // Pastor name is optional
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Pastor name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Pastor name cannot exceed 100 characters' };
  }
  
  // Check for valid name characters (letters, spaces, apostrophes, hyphens)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Pastor name can only contain letters, spaces, apostrophes, and hyphens' };
  }
  
  return { isValid: true };
};

export const validateSubdomain = (subdomain: string): ValidationResult => {
  if (!subdomain.trim()) {
    return { isValid: false, error: 'Subdomain is required' };
  }
  
  const cleanSubdomain = subdomain.trim().toLowerCase();
  
  if (cleanSubdomain.length < 3) {
    return { isValid: false, error: 'Subdomain must be at least 3 characters' };
  }
  
  if (cleanSubdomain.length > 63) {
    return { isValid: false, error: 'Subdomain cannot exceed 63 characters' };
  }
  
  // Check if starts/ends with alphanumeric and contains only valid characters
  const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
  if (!subdomainRegex.test(cleanSubdomain)) {
    return { 
      isValid: false, 
      error: 'Subdomain must start and end with a letter or number, and can only contain letters, numbers, and hyphens' 
    };
  }
  
  // Check for consecutive hyphens
  if (cleanSubdomain.includes('--')) {
    return { isValid: false, error: 'Subdomain cannot contain consecutive hyphens' };
  }
  
  // Check for reserved subdomains
  const reservedSubdomains = ['www', 'api', 'admin', 'dashboard', 'mail', 'ftp', 'localhost', 'test'];
  if (reservedSubdomains.includes(cleanSubdomain)) {
    return { isValid: false, error: 'This subdomain is reserved and cannot be used' };
  }
  
  return { isValid: true };
};

export const sanitizeSubdomain = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid characters with hyphens
    .replace(/--+/g, '-') // Replace consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .substring(0, 63); // Ensure max length
};

export const formatPhoneNumber = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length >= 10) {
    const match = digits.match(/^(\d{3})(\d{3})(\d{4})(\d*)$/);
    if (match) {
      const formatted = `(${match[1]}) ${match[2]}-${match[3]}`;
      return match[4] ? `${formatted} ext. ${match[4]}` : formatted;
    }
  }
  
  return input; // Return original if can't format
};
