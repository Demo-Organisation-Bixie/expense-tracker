import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditExpenseDialog } from '../EditExpenseDialog';
import { useExpenseMutations } from '../../hooks/useExpenseMutations';
import { Expense } from '../../types/expense';
import { AuthProvider } from '../../contexts/AuthContext';

vi.mock('../../hooks/useExpenseMutations', () => ({
  useExpenseMutations: vi.fn(),
}));

const mockExpense: Expense = {
  id: 'expense-int-react-1',
  name: 'Coffee',
  amount: 5.5,
  date: '2024-03-15',
  category: 'Food',
  type: 'Manual',
  comments: 'Morning coffee',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('RT-94 | React Update Flow | Integration | Tier: High', () => {
  const mockUpdateExpense = vi.fn();
  const mockDeleteExpense = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useExpenseMutations).mockReturnValue({
      updateExpense: mockUpdateExpense,
      deleteExpense: mockDeleteExpense,
    } as any);
  });

  describe('RT-94-IN-008: Full React update flow - dialog to mutation', () => {
    it('should pre-populate form, modify fields, submit, and call mutation', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      // Verify pre-population
      expect(screen.getByLabelText('Description')).toHaveValue('Coffee');
      expect(screen.getByLabelText('Amount')).toHaveValue(5.5);
      expect(screen.getByLabelText('Date')).toHaveValue('2024-03-15');
      expect(screen.getByLabelText('Category')).toHaveValue('Food');
      expect(screen.getByLabelText('Comments')).toHaveValue('Morning coffee');

      // Modify fields
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Coffee' } });
      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '7.5' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Transport' } });
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Updated comment' } });

      // Submit
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledWith('expense-int-react-1', {
          name: 'Updated Coffee',
          amount: 7.5,
          date: '2024-03-15',
          category: 'Transport',
          comments: 'Updated comment',
        });
      });
    });

    it('should handle update with minimal fields (no comments)', async () => {
      const minimalExpense: Expense = {
        id: 'expense-int-react-2',
        name: 'Bus',
        amount: 2.0,
        date: '2024-04-01',
        category: 'Transport',
        type: 'Cash',
      };

      render(<EditExpenseDialog open={true} expense={minimalExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Metro' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledWith('expense-int-react-2', {
          name: 'Metro',
          amount: 2.0,
          date: '2024-04-01',
          category: 'Transport',
          comments: '',
        });
      });
    });

    it('should close dialog on cancel', async () => {
      const onClose = vi.fn();
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={onClose} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should disable submit button during submission', async () => {
      render(
        <EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} isSubmitting={true} />,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('Save')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should handle string amount conversion', async () => {
      const expenseWithStringAmount: Expense = {
        ...mockExpense,
        amount: '12.99',
      };

      render(<EditExpenseDialog open={true} expense={expenseWithStringAmount} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByLabelText('Amount')).toHaveValue(12.99);

      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '15.5' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledWith('expense-int-react-1', {
          name: 'Coffee',
          amount: 15.5,
          date: '2024-03-15',
          category: 'Food',
          comments: 'Morning coffee',
        });
      });
    });
  });

  describe('RT-94-IN-009: React update flow with validation errors', () => {
    it('should prevent submission when description is empty', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Description'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });

      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('should prevent submission when amount is negative', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '-5' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Amount must be greater than zero')).toBeInTheDocument();
      });

      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('should prevent submission when amount is zero', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Amount must be greater than zero')).toBeInTheDocument();
      });

      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('should prevent submission when date is empty', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Date is required')).toBeInTheDocument();
      });

      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('should prevent submission when category is empty', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Category'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument();
      });

      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });
  });

  describe('RT-94-IN-010: React update flow - edge cases', () => {
    it('should handle expense with date as Date object', async () => {
      const expenseWithDateObject: Expense = {
        ...mockExpense,
        date: new Date('2024-05-20'),
      };

      render(<EditExpenseDialog open={true} expense={expenseWithDateObject} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByLabelText('Date')).toHaveValue('2024-05-20');
    });

    it('should not render dialog when open is false', async () => {
      render(<EditExpenseDialog open={false} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      expect(screen.queryByText('Edit Expense')).not.toBeInTheDocument();
    });

    it('should handle large amount values', async () => {
      const largeExpense: Expense = {
        ...mockExpense,
        amount: 999999.99,
      };

      render(<EditExpenseDialog open={true} expense={largeExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '500000' } });
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledWith('expense-int-react-1', {
          name: 'Coffee',
          amount: 500000,
          date: '2024-03-15',
          category: 'Food',
          comments: 'Morning coffee',
        });
      });
    });

    it('should handle multiple sequential updates', async () => {
      render(<EditExpenseDialog open={true} expense={mockExpense} onClose={vi.fn()} onSubmit={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      // First update
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'First Update' } });
      fireEvent.click(screen.getByText('Save'));
      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledTimes(1);
      });

      // Reset and second update
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Second Update' } });
      fireEvent.click(screen.getByText('Save'));
      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledTimes(2);
      });
    });
  });
});
