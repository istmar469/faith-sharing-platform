
import React, { useState } from 'react';
import { ArrowLeft, Eye, Trash2, Archive, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useContactFormSubmissions } from '@/hooks/useContactForms';
import { ContactFormSubmission, updateContactFormSubmission } from '@/services/contactFormService';
import { useTenantContext } from '@/components/context/TenantContext';

interface ContactFormSubmissionsProps {
  formId: string;
  onBack: () => void;
}

const ContactFormSubmissions: React.FC<ContactFormSubmissionsProps> = ({ formId, onBack }) => {
  const { organizationId } = useTenantContext();
  const { submissions, loading, refetch } = useContactFormSubmissions(organizationId);
  const { toast } = useToast();
  
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter submissions by form ID and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesForm = submission.form_id === formId;
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesForm && matchesStatus;
  });

  const handleViewDetails = (submission: ContactFormSubmission) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
  };

  const handleUpdateStatus = async (submissionId: string, status: ContactFormSubmission['status']) => {
    try {
      await updateContactFormSubmission(submissionId, { status });
      toast({
        title: 'Success',
        description: 'Submission status updated successfully',
      });
      refetch();
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      spam: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  const formatFormData = (formData: any) => {
    return Object.entries(formData).map(([key, value]) => (
      <div key={key} className="mb-3">
        <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>
        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
          {typeof value === 'string' ? value : JSON.stringify(value)}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
          <h2 className="text-2xl font-bold">Form Submissions</h2>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No submissions found</h3>
            <p className="mt-2 text-gray-500">
              {statusFilter === 'all' 
                ? 'No submissions have been received for this form yet.' 
                : `No submissions with status "${statusFilter}" found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Submission from {submission.form_data?.name || submission.form_data?.email || 'Unknown'}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      Submitted on {new Date(submission.created_at!).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                    {submission.email_sent && (
                      <Badge variant="outline">Email Sent</Badge>
                    )}
                    {submission.auto_response_sent && (
                      <Badge variant="outline">Auto-response Sent</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  {submission.form_data?.email && (
                    <div>
                      <span className="font-medium">Email:</span> {submission.form_data.email}
                    </div>
                  )}
                  {submission.submitted_from_ip && (
                    <div>
                      <span className="font-medium">IP Address:</span> {submission.submitted_from_ip}
                    </div>
                  )}
                </div>
                
                {submission.form_data?.message && (
                  <div className="mb-4">
                    <span className="font-medium text-sm">Message:</span>
                    <p className="text-gray-700 mt-1 line-clamp-3">
                      {submission.form_data.message}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <Select
                    value={submission.status}
                    onValueChange={(value) => handleUpdateStatus(submission.id!, value as ContactFormSubmission['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(submission)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submission Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div>
                  <strong>Submitted:</strong> {new Date(selectedSubmission.created_at!).toLocaleString()}
                </div>
                <div>
                  <strong>IP Address:</strong> {selectedSubmission.submitted_from_ip || 'N/A'}
                </div>
                <div>
                  <strong>User Agent:</strong> {selectedSubmission.user_agent ? 'Available' : 'N/A'}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Form Data:</h4>
                {formatFormData(selectedSubmission.form_data)}
              </div>
              
              {selectedSubmission.admin_notes && (
                <div>
                  <h4 className="font-medium mb-2">Admin Notes:</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedSubmission.admin_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactFormSubmissions;
