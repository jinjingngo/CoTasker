import { describe, it, expect, vi, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
import { render, screen } from '@testing-library/react';

import { CoToaster, loading, success, error, CoToastOption } from './CoToaster';

vi.mock('react-hot-toast', () => ({
  _esModule: true,
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => <>Toast Machine</>,
}));

describe('CoToaster', () => {
  describe('Component', () => {
    it('renders Toaster with correct props', () => {
      render(<CoToaster />);
      expect(screen.queryByText(/Toast Machine/)).toBeDefined();
    });
  });

  describe('Toast Functions', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls the loading function with correct parameters', () => {
      loading('Loading data...');
      expect(toast.loading).toHaveBeenCalledWith(
        'Loading data...',
        CoToastOption,
      );
    });

    it('calls the success function with correct parameters', () => {
      success('Success!');
      expect(toast.success).toHaveBeenCalledWith('Success!', CoToastOption);
    });

    it('calls the error function with correct parameters', () => {
      error('Error occurred');
      expect(toast.error).toHaveBeenCalledWith('Error occurred', CoToastOption);
    });
  });
});
