
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (!error && userData) {
          setIsSuperAdmin(userData.role === 'super_admin');
        }
      } catch (err) {
        console.error("Error checking super admin status:", err);
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
          
          {showDashboardButton && isSuperAdmin && (
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
