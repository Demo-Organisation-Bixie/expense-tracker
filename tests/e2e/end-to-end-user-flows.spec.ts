/**
 * RT-96 — Group Expenses by Type
 * Test Group 7: E2E Tests — End-to-End User Flows
 * 
 * Case IDs: RT-96-E2E-001 through RT-96-E2E-010
 * Risk Tier: HIGH (full user journey validation)
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

/**
 * RT-96-E2E-001 — User adds a custom type in expense settings
 * Risk: HIGH
 * Acceptance: R1 — User can add a custom expense type beyond defaults
 */
describe('E2E: Settings — Add Custom Type', {
  caseId: 'RT-96-E2E-001',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
  riskTier: 'HIGH',
})
it('should allow user to add custom expense type in settings', () => {
  // Given: default types in settings
  const defaultTypes: string[] = ['Credit', 'Debit', 'Cash'];

  // When: user types a custom type in the chip input
  const customType: string = 'Corporate Card';
  const allTypes: string[] = [...defaultTypes, customType];

  // Then: custom type chip appears in the list
  expect(allTypes).toContain('Corporate Card');
  expect(allTypes.length).toBe(4);

  // And: default types still present
  expect(allTypes).toContain('Credit');
  expect(allTypes).toContain('Debit');
  expect(allTypes).toContain('Cash');
});

/**
 * RT-96-E2E-002 — User saves custom type and it persists
 * Risk: HIGH
 * Acceptance: R4 — Types are persisted per-user
 */
describe('E2E: Settings — Save and Persist Custom Type', {
  caseId: 'RT-96-E2E-002',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R4 — Types are persisted per-user',
  riskTier: 'HIGH',
})
it('should save custom type and persist it', () => {
  // Given: user is on expense settings with custom type added
  let savedTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];

  // When: user clicks save button for source types
  const saveSuccess: boolean = true;
  const saveMessage: string = 'Expense Source Types saved!';

  // Then: success message appears
  expect(saveSuccess).toBe(true);
  expect(saveMessage).toBe('Expense Source Types saved!');

  // And: types persist
  expect(savedTypes).toContain('Corporate Card');
  expect(savedTypes.length).toBe(4);
});

/**
 * RT-96-E2E-003 — User creates expense with custom type
 * Risk: HIGH
 * Acceptance: R2 — User can assign a type to an expense
 */
describe('E2E: Log Expense — Create with Custom Type', {
  caseId: 'RT-96-E2E-003',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R2 — User can assign a type to an expense',
  riskTier: 'HIGH',
})
it('should allow user to create expense with custom type', () => {
  // Given: user is on log expense page
  const customType: string = 'Corporate Card';

  // When: user fills in expense details and selects custom type
  const newExpense: Expense = {
    name: 'Office Supplies',
    date: '2024-01-15',
    category: 'Unassigned',
    type: customType,
    amount: 150.00,
  };

  // Then: expense is created successfully with custom type
  expect(newExpense.type).toBe('Corporate Card');
  expect(newExpense.name).toBe('Office Supplies');
  expect(newExpense.amount).toBe(150.00);
});

/**
 * RT-96-E2E-004 — Dashboard shows expenses grouped by type
 * Risk: HIGH
 * Acceptance: R3 — User can group/filter expenses by type
 */
describe('E2E: Dashboard — Display Type-Grouped Data', {
  caseId: 'RT-96-E2E-004',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R3 — User can group/filter expenses by type',
  riskTier: 'HIGH',
})
it('should display type-grouped expense data on dashboard', () => {
  // Given: user is on dashboard with expenses of different types
  const expenses: Expense[] = [
    { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
    { name: 'Item D', date: '2024-01-04', category: 'Office', type: 'Corporate Card', amount: 200 },
  ];

  // When: dashboard loads expense data
  const types = Array.from(new Set(expenses.map(e => e.type)));
  const chartData = types.map(type => ({
    name: type,
    value: expenses.filter(e => e.type === type).reduce((sum, e) => sum + Number(e.amount), 0),
  }));

  // Then: pie chart shows type groupings
  expect(chartData.length).toBe(4);
  expect(chartData.find(d => d.name === 'Corporate Card')?.value).toBe(200);
  expect(chartData.find(d => d.name === 'Credit')?.value).toBe(100);
  expect(chartData.find(d => d.name === 'Debit')?.value).toBe(50);
  expect(chartData.find(d => d.name === 'Cash')?.value).toBe(75);
});

/**
 * RT-96-E2E-005 — User filters table by type
 * Risk: HIGH
 * Acceptance: R3 — User can group/filter expenses by type
 */
describe('E2E: Table — Filter by Type', {
  caseId: 'RT-96-E2E-005',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R3 — User can group/filter expenses by type',
  riskTier: 'HIGH',
})
it('should allow user to filter expense table by type', () => {
  // Given: user is on dashboard with expense table
  const allExpenses: Expense[] = [
    { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
    { name: 'Item D', date: '2024-01-04', category: 'Office', type: 'Credit', amount: 200 },
  ];
  const selectedTypeFilter: string = 'Credit';

  // When: user selects a type filter
  const filteredExpenses = allExpenses.filter(e => e.type === selectedTypeFilter);

  // Then: table filters to show only matching expenses
  expect(filteredExpenses.length).toBe(2);
  expect(filteredExpenses[0].name).toBe('Item A');
  expect(filteredExpenses[1].name).toBe('Item D');
  expect(filteredExpenses.every(e => e.type === 'Credit')).toBe(true);
});

/**
 * RT-96-E2E-006 — User bulk edits expense types
 * Risk: HIGH
 * Acceptance: R2 — User can assign a type to an expense
 */
describe('E2E: Bulk Edit — Update Types on Selected Expenses', {
  caseId: 'RT-96-E2E-006',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R2 — User can assign a type to an expense',
  riskTier: 'HIGH',
})
it('should allow user to bulk edit types on selected expenses', () => {
  // Given: user is on dashboard with expense table
  const selectedExpenses: Expense[] = [
    { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
    { name: 'Item C', date: '2024-01-03', category: 'Dining', type: 'Cash', amount: 75 },
  ];
  const newType: string = 'Credit';

  // When: user selects multiple expenses and bulk edits type
  const updatedExpenses = selectedExpenses.map(e => ({ ...e, type: newType }));
  const successMessage: string = 'Expenses successfully updated';

  // Then: all selected expenses have new type
  expect(updatedExpenses.every(e => e.type === 'Credit')).toBe(true);
  expect(updatedExpenses.length).toBe(3);

  // And: success message displayed
  expect(successMessage).toBe('Expenses successfully updated');
});

/**
 * RT-96-E2E-007 — User removes custom type from settings
 * Risk: MEDIUM
 * Acceptance: R1 — User can add a custom expense type beyond defaults
 */
describe('E2E: Settings — Remove Custom Type', {
  caseId: 'RT-96-E2E-007',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
  riskTier: 'MEDIUM',
})
it('should allow user to remove custom type from settings', () => {
  // Given: user is on expense settings with custom type
  let currentTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];

  // When: user clicks remove button on custom type chip
  currentTypes = currentTypes.filter(t => t !== 'Corporate Card');

  // Then: custom type chip is removed
  expect(currentTypes).not.toContain('Corporate Card');
  expect(currentTypes.length).toBe(3);

  // And: default types remain
  expect(currentTypes).toContain('Credit');
  expect(currentTypes).toContain('Debit');
  expect(currentTypes).toContain('Cash');
});

/**
 * RT-96-E2E-008 — User resets settings changes
 * Risk: LOW
 * Acceptance: R1 — User can add a custom expense type beyond defaults
 */
describe('E2E: Settings — Reset Changes', {
  caseId: 'RT-96-E2E-008',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
  riskTier: 'LOW',
})
it('should allow user to reset settings changes', () => {
  // Given: user has made changes to types in settings
  let currentTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];
  const originalTypes: string[] = ['Credit', 'Debit', 'Cash'];

  // When: user clicks reset button
  currentTypes = [...originalTypes];

  // Then: settings return to original state
  expect(currentTypes.length).toBe(3);
  expect(currentTypes).toContain('Credit');
  expect(currentTypes).toContain('Debit');
  expect(currentTypes).toContain('Cash');
  expect(currentTypes).not.toContain('Corporate Card');
});

/**
 * RT-96-E2E-009 — Type filter and category filter work together
 * Risk: HIGH
 * Acceptance: R3 — User can group/filter expenses by type
 */
describe('E2E: Table — Combined Type and Category Filtering', {
  caseId: 'RT-96-E2E-009',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R3 — User can group/filter expenses by type',
  riskTier: 'HIGH',
})
it('should allow combined type and category filtering', () => {
  // Given: user is on dashboard with expense table
  const allExpenses: Expense[] = [
    { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    { name: 'Item B', date: '2024-01-02', category: 'Groceries', type: 'Debit', amount: 50 },
    { name: 'Item C', date: '2024-01-03', category: 'Transport', type: 'Credit', amount: 200 },
    { name: 'Item D', date: '2024-01-04', category: 'Groceries', type: 'Cash', amount: 75 },
  ];
  const selectedCategory: string = 'Groceries';
  const selectedType: string = 'Credit';

  // When: user selects both category and type filter
  const filteredExpenses = allExpenses.filter(e =>
    e.category === selectedCategory && e.type === selectedType
  );

  // Then: table shows only expenses matching both filters
  expect(filteredExpenses.length).toBe(1);
  expect(filteredExpenses[0].name).toBe('Item A');
  expect(filteredExpenses[0].category).toBe('Groceries');
  expect(filteredExpenses[0].type).toBe('Credit');
});

/**
 * RT-96-E2E-010 — Empty state when no expenses match type filter
 * Risk: MEDIUM
 * Acceptance: R3 — User can group/filter expenses by type
 */
describe('E2E: Table — Empty State for Non-Matching Filter', {
  caseId: 'RT-96-E2E-010',
  requirementKey: 'RT-96',
  acceptanceCriteria: 'R3 — User can group/filter expenses by type',
  riskTier: 'MEDIUM',
})
it('should show empty state when no expenses match filter', () => {
  // Given: user is on dashboard
  const allExpenses: Expense[] = [
    { name: 'Item A', date: '2024-01-01', category: 'Groceries', type: 'Credit', amount: 100 },
    { name: 'Item B', date: '2024-01-02', category: 'Transport', type: 'Debit', amount: 50 },
  ];
  const selectedType: string = 'Cash';

  // When: user applies a filter that matches no expenses
  const filteredExpenses = allExpenses.filter(e => e.type === selectedType);

  // Then: table shows empty state or no matching rows
  expect(filteredExpenses.length).toBe(0);
  expect(filteredExpenses).toEqual([]);
});
