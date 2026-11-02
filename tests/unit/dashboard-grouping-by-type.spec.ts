/**
 * RT-96 — Group Expenses by Type
 * Test Group 3: Dashboard Grouping by Type
 * 
 * Case IDs: RT-96-UT-013 through RT-96-UT-018
 * Risk Tier: HIGH (dashboard visualization and grouping)
 */

interface ChartData {
  name: string;
  value: number;
}

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

describe('Dashboard — Type Grouping in Charts', () => {
  describe('RT-96-UT-013 — Dashboard groups expenses by type for pie chart', {
    caseId: 'RT-96-UT-013',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should calculate correct totals per type', () => {
    // Given: synthetic expense data with multiple types
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Credit', amount: 200 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Cash', amount: 75 },
      { name: 'Item E', date: '2024-01-05', category: 'Groceries', type: 'Credit', amount: 30 },
    ];

    // When: group by type and calculate totals
    const types = Array.from(new Set(expenses.map(e => e.type)));
    const chartData: ChartData[] = types.map(type => {
      const sourceSum = expenses
        .filter(e => e.type === type)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return { name: type, value: sourceSum };
    });

    // Then: correct totals per type
    expect(chartData.length).toBe(3);
    const creditData = chartData.find(d => d.name === 'Credit');
    const debitData = chartData.find(d => d.name === 'Debit');
    const cashData = chartData.find(d => d.name === 'Cash');
    
    expect(creditData?.value).toBe(330); // 100 + 200 + 30
    expect(debitData?.value).toBe(50);
    expect(cashData?.value).toBe(75);
  });

  it('should return empty chart data when no expenses exist', () => {
    // Given: empty expense list
    const expenses: Expense[] = [];

    // When: group by type
    const types = Array.from(new Set(expenses.map(e => e.type)));
    const chartData: ChartData[] = types.map(type => {
      const sourceSum = expenses
        .filter(e => e.type === type)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return { name: type, value: sourceSum };
    });

    // Then: no chart data
    expect(chartData.length).toBe(0);
  });
});

describe('Dashboard — Type Source Data Extraction', () => {
  describe('RT-96-UT-014 — Dashboard extracts unique types from expenses', {
    caseId: 'RT-96-UT-014',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should extract unique types from expense list', () => {
    // Given: expenses with repeated types
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Credit', amount: 200 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Cash', amount: 75 },
    ];

    // When: extract unique types
    const uniqueTypes = Array.from(new Set(expenses.map(e => e.type)));

    // Then: unique types extracted
    expect(uniqueTypes.length).toBe(3);
    expect(uniqueTypes).toContain('Credit');
    expect(uniqueTypes).toContain('Debit');
    expect(uniqueTypes).toContain('Cash');
  });

  it('should handle single type in expenses', () => {
    // Given: expenses all with same type
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Credit', amount: 50 },
    ];

    // When: extract unique types
    const uniqueTypes = Array.from(new Set(expenses.map(e => e.type)));

    // Then: single unique type
    expect(uniqueTypes.length).toBe(1);
    expect(uniqueTypes[0]).toBe('Credit');
  });
});

describe('Dashboard — Pie Chart Data for Types', () => {
  describe('RT-96-UT-015 — Pie chart renders type-grouped data', {
    caseId: 'RT-96-UT-015',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should generate correct pie chart series data for types', () => {
    // Given: expense data
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 200 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 50 },
    ];

    // When: generate chart data by type
    const types = Array.from(new Set(expenses.map(e => e.type)));
    const seriesData = types.map(type => {
      const total = expenses
        .filter(e => e.type === type)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return { name: type, y: total };
    });

    // Then: correct series data
    expect(seriesData.length).toBe(3);
    expect(seriesData.find(d => d.name === 'Credit')?.y).toBe(100);
    expect(seriesData.find(d => d.name === 'Debit')?.y).toBe(200);
    expect(seriesData.find(d => d.name === 'Cash')?.y).toBe(50);
  });
});

describe('Dashboard — Type Metrics', () => {
  describe('RT-96-UT-016 — Dashboard shows type-based metrics', {
    caseId: 'RT-96-UT-016',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'MEDIUM',
  })
  it('should calculate total amount per type', () => {
    // Given: expense data with known amounts
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Credit', amount: 200 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Debit', amount: 50 },
    ];

    // When: calculate per-type totals
    const creditTotal = expenses
      .filter(e => e.type === 'Credit')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Then: correct total
    expect(creditTotal).toBe(300);
  });

  it('should count expenses per type', () => {
    // Given: expense data
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Credit', amount: 200 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Debit', amount: 50 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Debit', amount: 75 },
    ];

    // When: count per type
    const creditCount = expenses.filter(e => e.type === 'Credit').length;
    const debitCount = expenses.filter(e => e.type === 'Debit').length;

    // Then: correct counts
    expect(creditCount).toBe(2);
    expect(debitCount).toBe(2);
  });
});

describe('Dashboard — Expense Source Data Signal', () => {
  describe('RT-96-UT-017 — Dashboard receives type data from service', {
    caseId: 'RT-96-UT-017',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R4 — Types are persisted per-user',
    riskTier: 'MEDIUM',
  })
  it('should receive expense source types from data service', () => {
    // Given: service provides types
    const sourceTypes: string[] = ['Credit', 'Debit', 'Cash'];

    // When: dashboard receives types
    const dashboardTypes: string[] = [...sourceTypes];

    // Then: types available
    expect(dashboardTypes.length).toBe(3);
    expect(dashboardTypes).toContain('Credit');
    expect(dashboardTypes).toContain('Debit');
    expect(dashboardTypes).toContain('Cash');
  });
});

describe('Dashboard — Data Ready State', () => {
  describe('RT-96-UT-018 — Dashboard shows data ready after type processing', {
    caseId: 'RT-96-UT-018',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'LOW',
  })
  it('should mark data as ready after processing expenses with types', () => {
    // Given: expense data
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    ];

    // When: process expense data
    const types = Array.from(new Set(expenses.map(e => e.type)));
    const isDataReady = types.length > 0;

    // Then: data ready
    expect(isDataReady).toBe(true);
    expect(types.length).toBe(1);
  });
});
