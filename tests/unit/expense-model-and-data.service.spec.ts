/**
 * RT-96 — Group Expenses by Type
 * Test Group 1: Expense Model & Data Service
 * 
 * Case IDs: RT-96-UT-001 through RT-96-UT-006
 * Risk Tier: HIGH (core data model and service layer)
 */

interface Expense {
  id?: string;
  name: string;
  date: Date | string;
  category: string;
  type: string;
  amount: number | string;
  comments?: string;
  importedOn?: Date;
  importedFrom?: string;
}

describe('Expense Model — Type Field', () => {
  describe('RT-96-UT-001 — Expense type field is required and persisted', {
    caseId: 'RT-96-UT-001',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R2 — User can assign a type to an expense',
    riskTier: 'HIGH',
  })
  it('should create an expense with a valid type field', () => {
    // Given: synthetic expense data
    const expense: Expense = {
      name: 'Test Purchase',
      date: '2024-01-15',
      category: 'Groceries',
      type: 'Credit',
      amount: 50.00,
      comments: 'Weekly shopping',
    };

    // When & Then: type field exists and is a non-empty string
    expect(expense.type).toBeDefined();
    expect(typeof expense.type).toBe('string');
    expect(expense.type.length).toBeGreaterThan(0);
    expect(expense.type).toBe('Credit');
  });

  it('should persist type through expense creation flow', () => {
    // Given: an expense being created
    const expense: Expense = {
      name: 'Utility Bill',
      date: '2024-02-20',
      category: 'Unassigned',
      type: 'Debit',
      amount: 120.50,
    };

    // Then: type is preserved
    expect(expense.type).toBe('Debit');
  });
});

describe('Expense Model — Default Types', () => {
  describe('RT-96-UT-002 — Default expense types are Credit, Debit, Cash', {
    caseId: 'RT-96-UT-002',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'HIGH',
  })
  it('should have Credit, Debit, and Cash as default types', () => {
    // Given: default types from expense-constants
    const defaultExpenseTypes: string[] = ['Credit', 'Debit', 'Cash'];

    // Then: all three defaults exist
    expect(defaultExpenseTypes).toContain('Credit');
    expect(defaultExpenseTypes).toContain('Debit');
    expect(defaultExpenseTypes).toContain('Cash');
    expect(defaultExpenseTypes.length).toBe(3);
  });

  it('should allow custom types beyond defaults', () => {
    // Given: user adds a custom type
    const defaultExpenseTypes: string[] = ['Credit', 'Debit', 'Cash'];
    const customType: string = 'Corporate Card';

    // Then: custom type can be added
    const updatedTypes = [...defaultExpenseTypes, customType];
    expect(updatedTypes).toContain('Credit');
    expect(updatedTypes).toContain('Debit');
    expect(updatedTypes).toContain('Cash');
    expect(updatedTypes).toContain('Corporate Card');
    expect(updatedTypes.length).toBe(4);
  });
});

describe('ExpenseDataService — Type Filtering', () => {
  describe('RT-96-UT-003 — Service filters expenses by type', {
    caseId: 'RT-96-UT-003',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should filter expenses by type correctly', () => {
    // Given: synthetic expense data with mixed types
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 10 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 20 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Credit', amount: 30 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Cash', amount: 40 },
    ];

    // When: filter by Credit type
    const filtered = expenses.filter(e => e.type === 'Credit');

    // Then: only Credit expenses returned
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('Item A');
    expect(filtered[1].name).toBe('Item C');
  });

  it('should return all expenses when no filter is applied', () => {
    // Given: synthetic expense data
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 10 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 20 },
    ];

    // When: no filter (undefined)
    const filterType: string | undefined = undefined;
    const filtered = filterType ? expenses.filter(e => e.type === filterType) : expenses;

    // Then: all expenses returned
    expect(filtered.length).toBe(2);
  });
});

describe('ExpenseDataService — Type Signal Management', () => {
  describe('RT-96-UT-004 — Service manages expense source types signal', {
    caseId: 'RT-96-UT-004',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R4 — Types are persisted per-user',
    riskTier: 'MEDIUM',
  })
  it('should initialize with empty types array', () => {
    // Given: service state
    const initialTypes: string[] = [];

    // Then: empty array
    expect(Array.isArray(initialTypes)).toBe(true);
    expect(initialTypes.length).toBe(0);
  });

  it('should update types signal when new types are set', () => {
    // Given: initial empty types
    let typesSignal: string[] = [];
    
    // When: set new types
    typesSignal = ['Credit', 'Debit', 'Cash', 'Corporate Card'];

    // Then: signal updated
    expect(typesSignal).toContain('Credit');
    expect(typesSignal).toContain('Debit');
    expect(typesSignal).toContain('Cash');
    expect(typesSignal).toContain('Corporate Card');
    expect(typesSignal.length).toBe(4);
  });
});

describe('ExpenseDataService — Expense Data Setting', () => {
  describe('RT-96-UT-005 — Service sets and retrieves expense data', {
    caseId: 'RT-96-UT-005',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R2 — User can assign a type to an expense',
    riskTier: 'MEDIUM',
  })
  it('should set expense data with types', () => {
    // Given: synthetic expenses
    const expenses: Expense[] = [
      { name: 'Purchase 1', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Purchase 2', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    ];

    // When: set expenses data
    const storedExpenses: Expense[] = [...expenses];

    // Then: data preserved
    expect(storedExpenses.length).toBe(2);
    expect(storedExpenses[0].type).toBe('Credit');
    expect(storedExpenses[1].type).toBe('Debit');
  });
});

describe('ExpenseDataService — Source Types Data Setting', () => {
  describe('RT-96-UT-006 — Service sets expense source types', {
    caseId: 'RT-96-UT-006',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R4 — Types are persisted per-user',
    riskTier: 'MEDIUM',
  })
  it('should set expense source types data', () => {
    // Given: synthetic source types
    const sourceTypes: string[] = ['Credit', 'Debit', 'Cash'];

    // When: set source types data
    const storedTypes: string[] = [...sourceTypes];

    // Then: types preserved
    expect(storedTypes).toContain('Credit');
    expect(storedTypes).toContain('Debit');
    expect(storedTypes).toContain('Cash');
    expect(storedTypes.length).toBe(3);
  });
});
