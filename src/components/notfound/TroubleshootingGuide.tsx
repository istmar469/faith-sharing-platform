import React from 'react';
import { isUuid, isDevelopmentEnvironment } from '@/utils/domain';

interface TroubleshootingGuideProps {
  isUuidSubdomain: boolean;
}

const TroubleshootingGuide = ({ isUuidSubdomain }: TroubleshootingGuideProps) => {
  return (
    <div className="text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
      <p className="font-medium">Are you trying to access a church website? Check these common issues:</p>
      <ul className="list-disc list-inside mt-2 text-left">
        <li>The subdomain is spelled correctly</li>
        <li>The organization has configured their domain in settings</li>
        <li>The organization has <span className="font-medium">enabled their website</span> in settings</li>
        <li>The organization has created and published a homepage</li>
        
        {isUuidSubdomain && isDevelopmentEnvironment() && (
          <li className="text-amber-600 font-medium">
            You are in a development environment where UUIDs should be accessed via: <br />
            <code className="bg-gray-100 px-1 py-0.5 text-xs rounded">/preview-domain/[UUID]</code>
          </li>
        )}
        {isUuidSubdomain && (
          <li>If you're using a UUID, use the preview URL format instead: <br />
            <code className="bg-gray-100 px-1 py-0.5 text-xs rounded">/preview-domain/[UUID]</code>
          </li>
        )}
      </ul>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-left text-xs text-gray-500">For organization administrators:</p>
        <ol className="list-decimal list-inside mt-1 text-left text-xs text-gray-500">
          <li>Go to your organization dashboard</li>
          <li>Check that your website is enabled</li>
          <li>Verify your subdomain is correctly set</li>
          <li>Ensure you have created and published a homepage</li>
        </ol>
      </div>
    </div>
  );
};

export default TroubleshootingGuide;
