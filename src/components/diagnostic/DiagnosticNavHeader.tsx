import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { isSuperAdmin } from '@/utils/superAdminCheck';

interface DiagnosticNavHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  showDashboardButton?: boolean;
  className?: string;
}

const DiagnosticNavHeader: React.FC<DiagnosticNavHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  showDashboardButton = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) {
        setIsSuperAdminUser(false);
        return;
      }

      try {
        // Use unified super admin check
        const adminStatus = await isSuperAdmin();
        setIsSuperAdminUser(adminStatus);
      } catch (error) {
        console.error('DiagnosticNavHeader: Error checking super admin status:', error);
        setIsSuperAdminUser(false);
      }
    };
    
    checkSuperAdminStatus();
  }, []);
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">{title}</h1>
        
        <div className="flex gap-2">
          {showBackButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          
          {showDashboardButton && isSuperAdminUser && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          )}
        </div>
      </div>
      
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

export default DiagnosticNavHeader;
