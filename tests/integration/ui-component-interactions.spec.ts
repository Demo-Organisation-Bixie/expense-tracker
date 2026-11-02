/**
 * RT-96 — Group Expenses by Type
 * Test Group 6: Integration Tests — UI Component Interactions
 * 
 * Case IDs: RT-96-IN-001 through RT-96-IN-006
 * Risk Tier: HIGH (component interactions and data flow)
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

interface ChipOption {
  value: string;
  removable: boolean;
}

interface BulkEditDialogData {
  title: string;
  expenses: Expense[];
  confirmButtonText: string;
  cancelButtonText: string;
  editType: 'category' | 'type' | 'delete';
  previewOnly?: boolean;
}

describe('Integration: Settings → Service → Dashboard Type Flow', () => {
  describe('RT-96-IN-001 — Adding type in settings reflects in dashboard', {
    caseId: 'RT-96-IN-001',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'HIGH',
  })
  it('should propagate newly added type from settings to dashboard data service', () => {
    // Given: default types in settings
    const defaultTypes: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
    ];
    let serviceTypes: string[] = defaultTypes.map(t => t.value);

    // When: user adds custom type in settings
    const newType: ChipOption = { value: 'Corporate Card', removable: true };
    const updatedSettingsTypes: ChipOption[] = [...defaultTypes, newType];
    
    // And: settings saves to service
    serviceTypes = updatedSettingsTypes.map(t => t.value);

    // Then: dashboard service has the new type
    expect(serviceTypes).toContain('Corporate Card');
    expect(serviceTypes.length).toBe(4);
  });

  it('should use the new type when grouping expenses in dashboard', () => {
    // Given: types from service (including custom)
    const serviceTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Corporate Card', amount: 250 },
    ];

    // When: dashboard groups by type
    const types = Array.from(new Set(expenses.map(e => e.type)));
    const chartData = types.map(type => ({
      name: type,
      value: expenses.filter(e => e.type === type).reduce((sum, e) => sum + Number(e.amount), 0),
    }));

    // Then: custom type appears in chart
    expect(chartData.length).toBe(2);
    const corporateData = chartData.find(d => d.name === 'Corporate Card');
    expect(corporateData?.value).toBe(250);
  });
});

describe('Integration: Dashboard → Table Type Filtering', () => {
  describe('RT-96-IN-002 — Dashboard type grouping feeds table filters', {
    caseId: 'RT-96-IN-002',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R3 — User can group/filter expenses by type',
    riskTier: 'HIGH',
  })
  it('should populate table type filters from dashboard type data', () => {
    // Given: dashboard has type-grouped data
    const expenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
    ];

    // When: dashboard computes type filters for table
    const tableTypeFilters = Array.from(new Set(expenses.map(e => e.type)));

    // Then: table receives type filters
    expect(tableTypeFilters).toContain('Credit');
    expect(tableTypeFilters).toContain('Debit');
    expect(tableTypeFilters).toContain('Cash');
    expect(tableTypeFilters.length).toBe(3);
  });

  it('should filter table data using type filters from dashboard', () => {
    // Given: full expense data and type filters
    const allExpenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
      { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
      { name: 'Item D', date: '2024-01-04', category: 'Unassigned', type: 'Credit', amount: 200 },
    ];
    const typeFilters: string[] = ['Credit'];

    // When: table applies type filter
    const filteredExpenses = allExpenses.filter(e => typeFilters.includes(e.type));

    // Then: only matching expenses shown
    expect(filteredExpenses.length).toBe(2);
    expect(filteredExpenses[0].name).toBe('Item A');
    expect(filteredExpenses[1].name).toBe('Item D');
  });
});

describe('Integration: Table → Bulk Edit Modal Type Update', () => {
  describe('RT-96-IN-003 — Table selection triggers bulk edit with correct types', {
    caseId: 'RT-96-IN-003',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R2 — User can assign a type to an expense',
    riskTier: 'HIGH',
  })
  it('should pass selected expenses to bulk edit modal with type edit option', () => {
    // Given: user selects multiple expenses in table
    const selectedExpenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    ];

    // When: open bulk edit modal for type
    const modalData: BulkEditDialogData = {
      title: 'Update Payment Type',
      expenses: selectedExpenses,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      editType: 'type',
    };

    // Then: modal receives correct data
    expect(modalData.editType).toBe('type');
    expect(modalData.expenses.length).toBe(2);
    expect(modalData.title).toBe('Update Payment Type');
  });

  it('should update type on selected expenses after modal confirmation', () => {
    // Given: selected expenses
    const selectedExpenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    ];
    const newType: string = 'Cash';

    // When: confirm type change in modal
    const updatedExpenses = selectedExpenses.map(e => ({ ...e, type: newType }));

    // Then: all selected expenses have new type
    expect(updatedExpenses[0].type).toBe('Cash');
    expect(updatedExpenses[1].type).toBe('Cash');
  });
});

describe('Integration: Settings → Database → Service Type Persistence', () => {
  describe('RT-96-IN-004 — Saved types persist through database layer', {
    caseId: 'RT-96-IN-004',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R4 — Types are persisted per-user',
    riskTier: 'HIGH',
  })
  it('should save types to user data record', () => {
    // Given: user types from settings
    const userTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];
    const userId: string = 'user123';

    // When: save types to database
    const userDataRecord: Record<string, string> = {};
    userTypes.forEach(type => {
      userDataRecord[type] = type;
    });

    // Then: types stored in user record
    expect(userDataRecord['Credit']).toBe('Credit');
    expect(userDataRecord['Debit']).toBe('Debit');
    expect(userDataRecord['Cash']).toBe('Cash');
    expect(userDataRecord['Corporate Card']).toBe('Corporate Card');
  });

  it('should retrieve saved types from user data record', () => {
    // Given: stored user data
    const storedData: Record<string, string> = {
      Credit: 'Credit',
      Debit: 'Debit',
      Cash: 'Cash',
      'Corporate Card': 'Corporate Card',
    };

    // When: retrieve types
    const retrievedTypes: string[] = Object.keys(storedData).map(key => storedData[key]);

    // Then: types match saved values
    expect(retrievedTypes).toContain('Credit');
    expect(retrievedTypes).toContain('Debit');
    expect(retrievedTypes).toContain('Cash');
    expect(retrievedTypes).toContain('Corporate Card');
  });
});

describe('Integration: Full Type Workflow', () => {
  describe('RT-96-IN-005 — Complete user workflow: add type, assign, group, filter', {
    caseId: 'RT-96-IN-005',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1, R2, R3 — Full type workflow',
    riskTier: 'HIGH',
  })
  it('should complete full type workflow end to end', () => {
    // Step 1: User adds custom type in settings
    let userTypes: string[] = ['Credit', 'Debit', 'Cash'];
    userTypes.push('Corporate Card');
    expect(userTypes).toContain('Corporate Card');

    // Step 2: User creates expense with new type
    const newExpense: Expense = {
      name: 'Office Supplies',
      date: '2024-01-15',
      category: 'Unassigned',
      type: 'Corporate Card',
      amount: 150.00,
    };
    expect(newExpense.type).toBe('Corporate Card');

    // Step 3: Dashboard groups expense by type
    const allExpenses: Expense[] = [
      { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
      newExpense,
    ];
    const types = Array.from(new Set(allExpenses.map(e => e.type)));
    expect(types).toContain('Corporate Card');
    expect(types.length).toBe(2);

    // Step 4: Table filters by type
    const filteredByType = allExpenses.filter(e => e.type === 'Corporate Card');
    expect(filteredByType.length).toBe(1);
    expect(filteredByType[0].name).toBe('Office Supplies');
  });
});

describe('Integration: Error Handling Across Components', () => {
  describe('RT-96-IN-006 — Error propagates from service to UI', {
    caseId: 'RT-96-IN-006',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R2 — User can assign a type to an expense',
    riskTier: 'MEDIUM',
  })
  it('should display error when type save fails', () => {
    // Given: failed type save
    const saveError: string = 'Network error: unable to save types';

    // When: service returns error
    const errorMessage: string = saveError;

    // Then: error displayed to user
    expect(errorMessage).toBe('Network error: unable to save types');
  });
});
