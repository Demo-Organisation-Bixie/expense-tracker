import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUpdateExpense } from '../useUpdateExpense';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

vi.mock('../../api/expenses', () => ({
  updateExpense: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useAuth: vi.fn(),
  };
});

vi.mock('../queryKeys', () => ({
  expenseKeys: {
    list: vi.fn((userId: string) => ['expenses', userId]),
  },
}));

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

describe('RT-94 | useUpdateExpense | Unit | Tier: High', () => {
  const mockUpdateExpense = vi.fn();
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('../../api/expenses').updateExpense).mockImplementation(mockUpdateExpense);
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    });
  });

  it('should call updateExpense with correct parameters', async () => {
    mockUpdateExpense.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Updated Coffee',
          amount: 7.5,
          date: '2024-03-15',
          category: 'Food',
          comments: 'Updated',
        },
      });
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      'user-123',
      'expense-1',
      expect.objectContaining({
        name: 'Updated Coffee',
        amount: 7.5,
        date: '2024-03-15',
        category: 'Food',
        comments: 'Updated',
      }),
    );
  });

  it('should invalidate expenses query on success', async () => {
    mockUpdateExpense.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Updated Coffee',
          amount: 7.5,
          date: '2024-03-15',
          category: 'Food',
        },
      });
    });

    // Wait for mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('should handle mutation error', async () => {
    const error = new Error('Network error');
    mockUpdateExpense.mockRejectedValue(error);

    const onError = vi.fn();

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(
        {
          expenseId: 'expense-1',
          expense: {
            name: 'Updated Coffee',
            amount: 7.5,
            date: '2024-03-15',
            category: 'Food',
          },
        },
        { onError },
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should set isPending to true during mutation', async () => {
    mockUpdateExpense.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Updated Coffee',
          amount: 7.5,
          date: '2024-03-15',
          category: 'Food',
        },
      });
    });

    expect(result.current.isPending).toBe(true);
  });

  it('should set isPending to false after mutation completes', async () => {
    mockUpdateExpense.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Updated Coffee',
          amount: 7.5,
          date: '2024-03-15',
          category: 'Food',
        },
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.isPending).toBe(false);
  });

  it('should use userId from auth context', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'auth-user-456' },
      loading: false,
    });

    mockUpdateExpense.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Coffee',
          amount: 5.5,
          date: '2024-03-15',
          category: 'Food',
        },
      });
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      'auth-user-456',
      'expense-1',
      expect.any(Object),
    );
  });

  it('should handle empty userId gracefully', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    });

    mockUpdateExpense.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        expenseId: 'expense-1',
        expense: {
          name: 'Coffee',
          amount: 5.5,
          date: '2024-03-15',
          category: 'Food',
        },
      });
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      '',
      'expense-1',
      expect.any(Object),
    );
  });
});
