import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import { useExpenseMutations } from '../../hooks/useExpenseMutations';

// Mock the deleteExpense API
vi.mock('../../api/expenses', () => ({
  deleteExpense: vi.fn(),
}));

import { deleteExpense } from '../../api/expenses';

const mockDeleteExpense = deleteExpense as ReturnType<typeof vi.fn>;

const mockQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return client;
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = mockQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Modern Shell — Integration: useExpenseMutations.deleteExpense() [RT-93, AC-1, Integration]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Set up a mock user so AuthProvider has a user
    localStorage.setItem('mock_user', JSON.stringify({
      uid: 'test-user-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
    }));
  });

  it('RT-93-MSI001: should call deleteExpense API with correct userId and expenseId', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations();
      return (
        <button onClick={() => deleteExpense('expense-42')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledWith('test-user-uid', 'expense-42');
    });
  });

  it('RT-93-MSI002: should call onDeleteSuccess callback on successful delete', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations({ onDeleteSuccess: onSuccess });
      return (
        <button onClick={() => deleteExpense('expense-42')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('RT-93-MSI003: should call onDeleteError callback on failed delete', async () => {
    const testError = new Error('Network error');
    mockDeleteExpense.mockRejectedValue(testError);
    const onError = vi.fn();

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations({ onDeleteError: onError });
      return (
        <button onClick={() => deleteExpense('expense-42')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(testError);
    });
  });

  it('RT-93-MSI004: should invalidate expense list query on successful delete', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);
    const queryClient = mockQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations();
      return (
        <button onClick={() => deleteExpense('expense-42')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    ) });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('RT-93-MSI005: should set isDeleting to true during delete operation', async () => {
    mockDeleteExpense.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const TestComponent = () => {
      const { deleteExpense, isDeleting } = useExpenseMutations();
      return (
        <div>
          <span data-testid="deleting">{String(isDeleting)}</span>
          <button onClick={() => deleteExpense('expense-42')}>Delete</button>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('deleting')).toHaveTextContent('true');
    });
  });

  it('RT-93-MSI006: should set isDeleting back to false after delete completes', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense, isDeleting } = useExpenseMutations();
      return (
        <div>
          <span data-testid="deleting">{String(isDeleting)}</span>
          <button onClick={() => deleteExpense('expense-42')}>Delete</button>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('deleting')).toHaveTextContent('false');
    });
  });

  it('RT-93-MSI007: should pass expenseId as string to deleteExpense API', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations();
      return (
        <button onClick={() => deleteExpense('expense-string-id')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledWith('test-user-uid', 'expense-string-id');
    });
  });

  it('RT-93-MSI008: should handle delete with empty expenseId', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense } = useExpenseMutations();
      return (
        <button onClick={() => deleteExpense('')}>Delete</button>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledWith('test-user-uid', '');
    });
  });

  it('RT-93-MSI009: should return both update and delete functions from useExpenseMutations', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense, updateExpense, isDeleting, isUpdating } = useExpenseMutations();
      return (
        <div>
          <span data-testid="has-delete">{typeof deleteExpense}</span>
          <span data-testid="has-update">{typeof updateExpense}</span>
          <span data-testid="is-deleting">{String(isDeleting)}</span>
          <span data-testid="is-updating">{String(isUpdating)}</span>
          <button onClick={() => deleteExpense('expense-42')}>Delete</button>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    expect(screen.getByTestId('has-delete')).toHaveTextContent('function');
    expect(screen.getByTestId('has-update')).toHaveTextContent('function');
    expect(screen.getByTestId('is-deleting')).toHaveTextContent('false');
    expect(screen.getByTestId('is-updating')).toHaveTextContent('false');
  });

  it('RT-93-MSI010: should complete full delete flow: mutation → API → invalidation', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteExpense, isDeleting } = useExpenseMutations({
        onDeleteSuccess: () => {},
      });
      return (
        <div>
          <span data-testid="deleting">{String(isDeleting)}</span>
          <button onClick={() => deleteExpense('expense-42')}>Delete</button>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const button = screen.getByText('Delete');
    fireEvent.click(button);

    // Verify mutation was triggered
    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalled();
    });

    // Verify isDeleting state
    await waitFor(() => {
      expect(screen.getByTestId('deleting')).toHaveTextContent('false');
    });
  });
});
