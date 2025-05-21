
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TenantDashboard from "./components/dashboard/TenantDashboard";
import SuperAdminDashboard from "./components/dashboard/SuperAdminDashboard";
import CustomDomainSettings from "./components/settings/CustomDomainSettings";
import TenantManagementSettings from "./components/settings/TenantManagementSettings";
import PageBuilder from "./components/pagebuilder/PageBuilder";
import AuthForm from "./components/auth/AuthForm";
import DomainPreview from "./components/pagebuilder/DomainPreview";
import OrganizationDashboard from "./components/dashboard/OrganizationDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/signup" element={<AuthForm />} />
          <Route path="/dashboard" element={<TenantDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/tenant-dashboard/:organizationId" element={<OrganizationDashboard />} />
          <Route path="/settings/custom-domain" element={<CustomDomainSettings />} />
          <Route path="/settings/tenant" element={<TenantManagementSettings />} />
          <Route path="/page-builder" element={<PageBuilder />} />
          <Route path="/page-builder/:pageId" element={<PageBuilder />} />
          <Route path="/preview-domain/:subdomain" element={<DomainPreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
