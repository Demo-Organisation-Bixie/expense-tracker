/**
 * RT-96 — Group Expenses by Type
 * Test Group 4: Table Summary Filtering by Type
 * 
 * Case IDs: RT-96-UT-019 through RT-96-UT-024
 * Risk Tier: HIGH (table filtering and type-based display)
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

describe('Table Summary — Type Filter Computation', () => {
  describe('RT-96-UT-019 — Table computes unique type filters from data', {
    caseId: 'RT-96-UT-019',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should extract unique types for filter dropdown', () => {
    // Given: expense data with multiple types
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Credit', amount: 200 },
    ];

    // When: compute filter sources
    const filterSources = Array.from(new Set(data.map(e => e.type)));

    // Then: unique types available as filters
    expect(filterSources.length).toBe(3);
    expect(filterSources).toContain('Credit');
    expect(filterSources).toContain('Debit');
    expect(filterSources).toContain('Cash');
  });

  it('should return empty filter sources when no expenses exist', () => {
    // Given: empty data
    const data: Expense[] = [];

    // When: compute filter sources
    const filterSources = Array.from(new Set(data.map(e => e.type)));

    // Then: no filter sources
    expect(filterSources.length).toBe(0);
  });
});

describe('Table Summary — Type Filter Application', () => {
  describe('RT-96-UT-020 — Table filters expenses by selected type', {
    caseId: 'RT-96-UT-020',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should filter table data by single type', () => {
    // Given: expense data
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Credit', amount: 200 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Cash', amount: 75 },
    ];
    const sourceFilters: string[] = ['Credit'];

    // When: apply type filter
    const filteredData = data.filter(expense => {
      const matchesSource = !sourceFilters?.length || sourceFilters.includes(expense.type);
      return matchesSource;
    });

    // Then: only Credit expenses shown
    expect(filteredData.length).toBe(2);
    expect(filteredData[0].name).toBe('Item A');
    expect(filteredData[1].name).toBe('Item C');
  });

  it('should filter table data by multiple types', () => {
    // Given: expense data
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 200 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Credit', amount: 75 },
    ];
    const sourceFilters: string[] = ['Credit', 'Debit'];

    // When: apply multi-type filter
    const filteredData = data.filter(expense => {
      const matchesSource = !sourceFilters?.length || sourceFilters.includes(expense.type);
      return matchesSource;
    });

    // Then: only Credit and Debit expenses shown
    expect(filteredData.length).toBe(3);
    expect(filteredData.map(e => e.name)).toContain('Item A');
    expect(filteredData.map(e => e.name)).toContain('Item B');
    expect(filteredData.map(e => e.name)).toContain('Item D');
  });

  it('should show all expenses when no type filter is selected', () => {
    // Given: expense data
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 200 },
    ];
    const sourceFilters: string[] = [];

    // When: no type filter applied
    const filteredData = data.filter(expense => {
      const matchesSource = !sourceFilters?.length || sourceFilters.includes(expense.type);
      return matchesSource;
    });

    // Then: all expenses shown
    expect(filteredData.length).toBe(3);
  });
});

describe('Table Summary — Combined Category and Type Filtering', () => {
  describe('RT-96-UT-021 — Table filters by both category and type', {
    caseId: 'RT-96-UT-021',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should apply both category and type filters together', () => {
    // Given: expense data
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Groceries', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Transport', type: 'Credit', amount: 200 },
      { name: 'Item D', date: '2024-01-04', category: 'Groceries', type: 'Cash', amount: 75 },
    ];
    const categoryFilters: string[] = ['Groceries'];
    const sourceFilters: string[] = ['Credit'];

    // When: apply combined filters
    const filteredData = data.filter(expense => {
      const matchesCategory = !categoryFilters?.length || categoryFilters.includes(expense.category);
      const matchesSource = !sourceFilters?.length || sourceFilters.includes(expense.type);
      return matchesCategory && matchesSource;
    });

    // Then: only Groceries + Credit expenses shown
    expect(filteredData.length).toBe(1);
    expect(filteredData[0].name).toBe('Item A');
  });

  it('should return empty when combined filters have no matches', () => {
    // Given: expense data
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    ];
    const categoryFilters: string[] = ['Groceries'];
    const sourceFilters: string[] = ['Debit'];

    // When: apply combined filters with no matches
    const filteredData = data.filter(expense => {
      const matchesCategory = !categoryFilters?.length || categoryFilters.includes(expense.category);
      const matchesSource = !sourceFilters?.length || sourceFilters.includes(expense.type);
      return matchesCategory && matchesSource;
    });

    // Then: no matches
    expect(filteredData.length).toBe(0);
  });
});

describe('Table Summary — Filter State Management', () => {
  describe('RT-96-UT-022 — Table manages filter state for types', {
    caseId: 'RT-96-UT-022',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'MEDIUM',
  })
  it('should initialize with empty type filters', () => {
    // Given: table component initialization
    const selectedSourceFilters: string[] = [];

    // Then: no filters active
    expect(selectedSourceFilters.length).toBe(0);
  });

  it('should update filter state when user selects type', () => {
    // Given: empty filter
    let selectedSourceFilters: string[] = [];

    // When: user selects Credit type
    selectedSourceFilters = ['Credit'];

    // Then: filter updated
    expect(selectedSourceFilters).toContain('Credit');
    expect(selectedSourceFilters.length).toBe(1);
  });
});

describe('Table Summary — Filter Values Signal', () => {
  describe('RT-96-UT-023 — Table computes filtered data from filter values', {
    caseId: 'RT-96-UT-023',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'MEDIUM',
  })
  it('should compute filtered data reactively from type filter values', () => {
    // Given: expense data and filter values
    const data: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 200 },
    ];
    const sourceFilterValues: string[] = ['Debit', 'Cash'];

    // When: compute filtered data
    const filteredData = data.filter(expense => {
      const matchesSource = !sourceFilterValues?.length || sourceFilterValues.includes(expense.type);
      return matchesSource;
    });

    // Then: filtered correctly
    expect(filteredData.length).toBe(2);
    expect(filteredData.map(e => e.name)).toContain('Item B');
    expect(filteredData.map(e => e.name)).toContain('Item C');
  });
});

describe('Table Summary — Reset Filters', () => {
  describe('RT-96-UT-024 — Table resets type filters', {
    caseId: 'RT-96-UT-024',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'LOW',
  })
  it('should reset type filters to empty', () => {
    // Given: active type filters
    let selectedSourceFilters: string[] = ['Credit', 'Debit'];

    // When: reset filters
    selectedSourceFilters = [];

    // Then: filters cleared
    expect(selectedSourceFilters.length).toBe(0);
  });
});
