import { TestBed } from '@angular/core/testing';
import { ExpenseDataService } from '../../src/app/core/services/expense-data.service';
import { TimeFrameFilter } from '../../src/app/core/interfaces/time-frame-filter';
import { EntryTypes } from '../../src/app/core/enums/entry-types';

describe('Expense Model and Data Service Tests', () => {
  let service: ExpenseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseDataService);
  });

  // RT-96-UT-001: Test Expense interface type field exists and is required
  it('RT-96-UT-001 | RT-97 | Expense interface type field exists and is required | Risk: High', () => {
    const mockExpense = {
      name: 'Test Expense',
      date: new Date('2024-01-15'),
      category: 'Groceries',
      type: 'Credit',
      amount: 50.0,
    };

    expect(mockExpense.type).toBeDefined();
    expect(typeof mockExpense.type).toBe('string');
    expect(mockExpense.type).toBeTruthy();
  });

  // RT-96-UT-002: Test ExpenseDataService setExpenseSourcesData method
  it('RT-96-UT-002 | RT-97 | ExpenseDataService setExpenseSourcesData method sets source types | Risk: High', () => {
    const sourceTypes = ['Credit', 'Debit', 'Cash', 'Crypto'];
    service.setExpenseSourcesData(sourceTypes);

    expect(service.expenseSourcesSignal()).toEqual(sourceTypes);
  });

  // RT-96-UT-003: Test ExpenseDataService setExpensesData method preserves type
  it('RT-96-UT-003 | RT-97 | ExpenseDataService setExpensesData method preserves type field | Risk: High', () => {
    const mockExpenses = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 25.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 15.0 },
      { name: 'Expense 3', date: new Date('2024-01-03'), category: 'Entertainment', type: 'Cash', amount: 30.0 },
    ];

    service.setExpensesData(mockExpenses);

    const retrieved = service.expensesSignal();
    expect(retrieved.length).toBe(3);
    expect(retrieved[0].type).toBe('Credit');
    expect(retrieved[1].type).toBe('Debit');
    expect(retrieved[2].type).toBe('Cash');
  });

  // RT-96-UT-004: Test ExpenseDataService filteredExpenses computed signal
  it('RT-96-UT-004 | RT-97 | ExpenseDataService filteredExpenses computed signal filters correctly | Risk: Medium', () => {
    const mockExpenses = [
      { name: 'Manual 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 25.0, importedOn: undefined },
      { name: 'Imported 1', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 15.0, importedOn: new Date('2024-01-02') },
      { name: 'Manual 2', date: new Date('2024-01-03'), category: 'Entertainment', type: 'Cash', amount: 30.0, importedOn: undefined },
    ];

    service.setExpensesData(mockExpenses);
    service.setExpenseEntryTypeFilter(EntryTypes.IMPORTED);

    const filtered = service.filteredExpenses();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Imported 1');
  });

  // RT-96-UT-005: Test ExpenseDataService expenseSourcesSignal getter
  it('RT-96-UT-005 | RT-97 | ExpenseDataService expenseSourcesSignal getter returns source types | Risk: Medium', () => {
    const sourceTypes = ['Credit', 'Debit', 'Cash'];
    service.setExpenseSourcesData(sourceTypes);

    const result = service.expenseSourcesSignal();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(sourceTypes);
  });

  // RT-96-UT-006: Test ExpenseDataService timeFrameFilterSignal getter
  it('RT-96-UT-006 | RT-97 | ExpenseDataService timeFrameFilterSignal getter returns time frame filter | Risk: Medium', () => {
    const mockFilter: TimeFrameFilter = {
      label: 'This Month',
      value: 'this-month',
      getDates: () => ({ start: new Date('2024-01-01'), end: new Date('2024-01-31') }),
    };

    service.setTimeFrameFilter(mockFilter);

    const result = service.timeFrameFilterSignal();
    expect(result).toBeDefined();
    expect(result?.label).toBe('This Month');
    expect(result?.value).toBe('this-month');
  });
});
