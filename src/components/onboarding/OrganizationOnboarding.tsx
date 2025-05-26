
import React, { useState } from 'react';
import OrganizationCreationForm from './OrganizationCreationForm';
import OrganizationCreationSuccess from './OrganizationCreationSuccess';
import SubdomainTester from '../testing/SubdomainTester';

type OnboardingStep = 'form' | 'success' | 'testing';

const OrganizationOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('form');
  const [createdOrganization, setCreatedOrganization] = useState<{
    id: string;
    subdomain: string;
  } | null>(null);

  const handleOrganizationCreated = (organizationId: string, subdomain: string) => {
    setCreatedOrganization({ id: organizationId, subdomain });
    setCurrentStep('success');
  };

  const handleTestNavigation = () => {
    setCurrentStep('testing');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setCreatedOrganization(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {currentStep === 'form' && (
          <OrganizationCreationForm onSuccess={handleOrganizationCreated} />
        )}

        {currentStep === 'success' && createdOrganization && (
          <OrganizationCreationSuccess
            organizationId={createdOrganization.id}
            subdomain={createdOrganization.subdomain}
            onTestNavigation={handleTestNavigation}
          />
        )}

        {currentStep === 'testing' && createdOrganization && (
          <div className="space-y-6">
            <SubdomainTester
              subdomain={createdOrganization.subdomain}
              organizationId={createdOrganization.id}
            />
            <div className="text-center">
              <button
                onClick={handleBackToForm}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to Organization Creation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
