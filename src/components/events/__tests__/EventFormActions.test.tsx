
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import EventFormActions from '../EventFormActions';

describe('EventFormActions', () => {
  const defaultProps = {
    loading: false,
    isSubmitting: false,
    onCancel: vi.fn(),
  };

  it('renders cancel and submit buttons', () => {
    render(<EventFormActions {...defaultProps} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('shows "Update Event" when editing existing event', () => {
    const mockEvent = { id: '1', name: 'Test Event' } as any;
    render(<EventFormActions {...defaultProps} event={mockEvent} />);
    
    expect(screen.getByText('Update Event')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(<EventFormActions {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    
    render(<EventFormActions {...defaultProps} onCancel={onCancel} />);
    
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows loading state when submitting', () => {
    render(<EventFormActions {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });
});
