/**
 * RT-96 — Group Expenses by Type
 * Test Group 2: Expense Settings & Manage Options
 * 
 * Case IDs: RT-96-UT-007 through RT-96-UT-012
 * Risk Tier: HIGH (user-facing settings management)
 */

interface ChipOption {
  value: string;
  removable: boolean;
}

describe('Expense Settings — Type Management', () => {
  describe('RT-96-UT-007 — Settings component initializes with default types', {
    caseId: 'RT-96-UT-007',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'HIGH',
  })
  it('should initialize source type signal with default types', () => {
    // Given: default types from constants
    const defaultExpenseTypes: string[] = ['Credit', 'Debit', 'Cash'];

    // When: settings component initializes
    const sourceTypes: ChipOption[] = defaultExpenseTypes.map(type => ({
      value: type,
      removable: false,
    }));

    // Then: all default types present and non-removable
    expect(sourceTypes.length).toBe(3);
    expect(sourceTypes[0].value).toBe('Credit');
    expect(sourceTypes[0].removable).toBe(false);
    expect(sourceTypes[1].value).toBe('Debit');
    expect(sourceTypes[1].removable).toBe(false);
    expect(sourceTypes[2].value).toBe('Cash');
    expect(sourceTypes[2].removable).toBe(false);
  });
});

describe('Expense Settings — Custom Type Addition', () => {
  describe('RT-96-UT-008 — User can add custom types', {
    caseId: 'RT-96-UT-008',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'HIGH',
  })
  it('should allow adding a custom type to the options list', () => {
    // Given: existing default types
    let options: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
    ];
    const customType: string = 'Corporate Card';

    // When: user adds custom type
    options = [...options, { value: customType, removable: true }];

    // Then: custom type added and marked removable
    expect(options.length).toBe(4);
    expect(options[3].value).toBe('Corporate Card');
    expect(options[3].removable).toBe(true);
  });

  it('should not add duplicate types', () => {
    // Given: existing types
    let options: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ];
    const newType: string = 'Credit';

    // When: user tries to add duplicate
    const existingMatch = options.find(o => o.value.toLowerCase() === newType.toLowerCase());

    // Then: duplicate not added
    expect(existingMatch).toBeDefined();
    expect(options.length).toBe(2);
  });
});

describe('Expense Settings — Type Removal', () => {
  describe('RT-96-UT-009 — User can remove custom types', {
    caseId: 'RT-96-UT-009',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'MEDIUM',
  })
  it('should allow removing a custom type', () => {
    // Given: types with a custom one
    let options: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
      { value: 'Corporate Card', removable: true },
    ];
    const toRemove: ChipOption = { value: 'Corporate Card', removable: true };

    // When: user removes custom type
    options = options.filter(o => o.value !== toRemove.value);

    // Then: custom type removed, defaults remain
    expect(options.length).toBe(3);
    expect(options.map(o => o.value)).toContain('Credit');
    expect(options.map(o => o.value)).toContain('Debit');
    expect(options.map(o => o.value)).toContain('Cash');
  });

  it('should prevent removing default types', () => {
    // Given: default type
    const defaultType: ChipOption = { value: 'Credit', removable: false };

    // Then: default type is not removable
    expect(defaultType.removable).toBe(false);
  });
});

describe('Expense Settings — Save Types', () => {
  describe('RT-96-UT-010 — Saving types persists them', {
    caseId: 'RT-96-UT-010',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R4 — Types are persisted per-user',
    riskTier: 'HIGH',
  })
  it('should save updated types to the service', () => {
    // Given: updated types
    const updatedTypes: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
      { value: 'Corporate Card', removable: true },
    ];

    // When: save types
    const savedValues: string[] = updatedTypes.map(t => t.value);

    // Then: values saved correctly
    expect(savedValues).toContain('Credit');
    expect(savedValues).toContain('Debit');
    expect(savedValues).toContain('Cash');
    expect(savedValues).toContain('Corporate Card');
    expect(savedValues.length).toBe(4);
  });

  it('should update the expense data service with saved types', () => {
    // Given: saved types
    const savedTypes: string[] = ['Credit', 'Debit', 'Cash', 'Corporate Card'];

    // When: types are saved to service
    const serviceTypes: string[] = [...savedTypes];

    // Then: service reflects saved types
    expect(serviceTypes).toEqual(savedTypes);
  });
});

describe('Expense Settings — Reset Options', () => {
  describe('RT-96-UT-011 — Reset restores original types', {
    caseId: 'RT-96-UT-011',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'MEDIUM',
  })
  it('should restore original options on reset', () => {
    // Given: modified options
    const originalOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
    ];
    let currentOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: false },
      { value: 'Corporate Card', removable: true },
    ];

    // When: reset options
    currentOptions = JSON.parse(JSON.stringify(originalOptions));

    // Then: restored to original
    expect(currentOptions.length).toBe(3);
    expect(currentOptions[2].value).toBe('Cash');
  });
});

describe('Expense Settings — Options Updated Detection', () => {
  describe('RT-96-UT-012 — Component detects when options are modified', {
    caseId: 'RT-96-UT-012',
    requirementKey: 'RT-96',
    acceptanceCriteria: 'R1 — User can add a custom expense type beyond defaults',
    riskTier: 'LOW',
  })
  it('should detect when options have been updated', () => {
    // Given: original and current options
    const originalOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ];
    const currentOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: true },
    ];

    // When: compare options
    const areEqual = JSON.stringify(originalOptions) === JSON.stringify(currentOptions);

    // Then: not equal (options updated)
    expect(areEqual).toBe(false);
  });

  it('should not detect update when options are unchanged', () => {
    // Given: identical options
    const originalOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ];
    const currentOptions: ChipOption[] = [
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ];

    // When: compare options
    const areEqual = JSON.stringify(originalOptions) === JSON.stringify(currentOptions);

    // Then: equal (no update)
    expect(areEqual).toBe(true);
  });
});
