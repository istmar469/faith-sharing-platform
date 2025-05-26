
// Environment detection utilities
export const isDevelopmentEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname.includes('lovable.app') || hostname.includes('127.0.0.1');
};

export const shouldRequireEmailVerification = (): boolean => {
  // Always require email verification in production
  // Skip in development for easier testing
  return !isDevelopmentEnvironment();
};

export const getEnvironmentName = (): string => {
  if (isDevelopmentEnvironment()) {
    return 'development';
  }
  return 'production';
};

export const getCurrentDomain = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    return 'lovable.app';
  }
  return 'church-os.com';
};
