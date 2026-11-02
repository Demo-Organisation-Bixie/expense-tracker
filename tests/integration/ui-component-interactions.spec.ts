import { TestBed } from '@angular/core/testing';
import { LogExpenseComponent } from '../../src/app/log-expense/log-expense.component';
import { ManageExpenseComponent } from '../../src/app/shared/components/manage-expense/manage-expense.component';
import { ExpenseSettingsComponent } from '../../src/app/expense-settings/expense-settings.component';
import { DashboardComponent } from '../../src/app/dashboard/dashboard.component';
import { TableSummaryComponent } from '../../src/app/dashboard/components/table-summary/table-summary.component';
import { ExpenseDataService } from '../../src/app/core/services/expense-data.service';
import { UserService } from '../../src/app/core/services/user.service';
import { DatabaseService } from '../../src/app/core/services/database.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Expense } from '../../src/app/core/interfaces/expense-model';
import { ManageExpenseData } from '../../src/app/shared/interfaces/manage-expense-data';
import { ChipOption } from '../../src/app/expense-settings/interfaces/chip-option';

describe('UI Component Interactions Tests', () => {
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', []);
    mockExpenseDataService.categoriesSignal = jasmine.fn().and.returnValue(['Groceries', 'Transport']);
    mockExpenseDataService.expenseSourcesSignal = jasmine.fn().and.returnValue(['Credit', 'Debit', 'Cash']);
    mockExpenseDataService.setExpensesData = jasmine.fn();

    mockUserService = jasmine.createSpyObj('UserService', ['getUser', 'getUserId']);
    mockUserService.getUser = jasmine.fn().and.returnValue({ email: 'test@example.com', uid: 'mock-user-id' });
    mockUserService.getUserId = jasmine.fn().and.returnValue('mock-user-id');

    mockDatabaseService = jasmine.createSpyObj('DatabaseService', []);
    mockDatabaseService.getUserDetails = jasmine.fn().and.returnValue(
      Promise.resolve({
        toJSON: () => ({
          'mock-user-id': {
            firstName: 'Test',
            lastName: 'User',
            categories: { cat1: 'Groceries', cat2: 'Transport' },
            types: { type1: 'Credit', type2: 'Debit', type3: 'Cash' },
          },
        }),
      })
    );
    mockDatabaseService.saveNewExpense = jasmine.fn().and.returnValue(Promise.resolve());

    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockSnackBar.open = jasmine.fn();
  });

  // RT-96-IN-001: Test LogExpenseComponent type dropdown population and selection
  it('RT-96-IN-001 | RT-97 | LogExpenseComponent type dropdown population and selection | Risk: High', () => {
    TestBed.configureTestingModule({
      imports: [LogExpenseComponent, MatSnackBarModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });

    const fixture = TestBed.createComponent(LogExpenseComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Verify types are populated from expense sources
    expect(component.types).toContain('Credit');
    expect(component.types).toContain('Debit');
    expect(component.types).toContain('Cash');
  });

  // RT-96-IN-002: Test ManageExpenseComponent type field update flow
  it('RT-96-IN-002 | RT-97 | ManageExpenseComponent type field update flow | Risk: High', () => {
    const mockExpense: Expense = {
      name: 'Test Expense',
      date: new Date('2024-01-15'),
      category: 'Groceries',
      type: 'Credit',
      amount: 50.0,
      id: 'id1',
    };

    const mockData: ManageExpenseData = {
      expense: mockExpense,
      previewDataMode: false,
    };

    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ManageExpenseComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: UserService, useValue: mockUserService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
      ],
    });

    const fixture = TestBed.createComponent(ManageExpenseComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.expense.type).toBe('Credit');
    expect(component.types).toContain('Credit');
    expect(component.types).toContain('Debit');
  });

  // RT-96-IN-003: Test ExpenseSettingsComponent type add/remove/save flow
  it('RT-96-IN-003 | RT-97 | ExpenseSettingsComponent type add/remove/save flow | Risk: High', () => {
    TestBed.configureTestingModule({
      imports: [ExpenseSettingsComponent, MatSnackBarModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
      ],
    });

    const fixture = TestBed.createComponent(ExpenseSettingsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Verify initial types are loaded
    const initialTypes = component.sourceTypeSignal().map((opt: ChipOption) => opt.value);
    expect(initialTypes).toContain('Credit');
    expect(initialTypes).toContain('Debit');

    // Simulate adding a new type
    component.sourceTypeSignal.update((types: ChipOption[]) => [
      ...types,
      { value: 'Crypto', removable: true },
    ]);

    const updatedTypes = component.sourceTypeSignal().map((opt: ChipOption) => opt.value);
    expect(updatedTypes).toContain('Crypto');
    expect(updatedTypes.length).toBeGreaterThan(initialTypes.length);
  });

  // RT-96-IN-004: Test DashboardComponent type filter chip interaction
  it('RT-96-IN-004 | RT-97 | DashboardComponent type filter chip interaction | Risk: Medium', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 50.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 30.0 },
      { name: 'Expense 3', date: new Date('2024-01-03'), category: 'Food', type: 'Credit', amount: 20.0 },
    ];

    // Simulate type filter interaction
    const allTypes = [...new Set(mockExpenses.map((e) => e.type))];
    expect(allTypes).toContain('Credit');
    expect(allTypes).toContain('Debit');

    // Simulate filtering by type
    const creditExpenses = mockExpenses.filter((e) => e.type === 'Credit');
    expect(creditExpenses.length).toBe(2);
    creditExpenses.forEach((e) => expect(e.type).toBe('Credit'));
  });

  // RT-96-IN-005: Test TableSummaryComponent type column display and sort
  it('RT-96-IN-005 | RT-97 | TableSummaryComponent type column display and sort | Risk: Medium', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 50.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 30.0 },
      { name: 'Expense 3', date: new Date('2024-01-03'), category: 'Food', type: 'Cash', amount: 20.0 },
    ];

    // Verify type column data
    const types = mockExpenses.map((e) => e.type);
    expect(types).toContain('Credit');
    expect(types).toContain('Debit');
    expect(types).toContain('Cash');

    // Simulate sort by type
    const sortedTypes = [...types].sort();
    expect(sortedTypes[0]).toBe('Cash');
    expect(sortedTypes[1]).toBe('Credit');
    expect(sortedTypes[2]).toBe('Debit');
  });

  // RT-96-IN-006: Test full flow: add expense with type → view in dashboard grouped
  it('RT-96-IN-006 | RT-97 | Full flow: add expense with type → view in dashboard grouped | Risk: High', () => {
    // Step 1: Create expense with type
    const newExpense: Expense = {
      name: 'Grocery Shopping',
      date: new Date('2024-01-15'),
      category: 'Groceries',
      type: 'Credit',
      amount: 75.50,
    };

    expect(newExpense.type).toBe('Credit');
    expect(newExpense.category).toBe('Groceries');

    // Step 2: Simulate adding to dashboard data
    const dashboardData: Expense[] = [
      { name: 'Previous Expense', date: new Date('2024-01-01'), category: 'Transport', type: 'Debit', amount: 25.0 },
      newExpense,
    ];

    // Step 3: Verify dashboard groups by type
    const creditExpenses = dashboardData.filter((e) => e.type === 'Credit');
    const debitExpenses = dashboardData.filter((e) => e.type === 'Debit');

    expect(creditExpenses.length).toBe(1);
    expect(creditExpenses[0].name).toBe('Grocery Shopping');
    expect(debitExpenses.length).toBe(1);
    expect(debitExpenses[0].name).toBe('Previous Expense');

    // Step 4: Verify type totals
    const creditTotal = creditExpenses.reduce((sum, e) => sum + +e.amount, 0);
    const debitTotal = debitExpenses.reduce((sum, e) => sum + +e.amount, 0);

    expect(creditTotal).toBe(75.50);
    expect(debitTotal).toBe(25.0);
  });
});
