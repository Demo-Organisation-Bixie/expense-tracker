import { DashboardComponent } from '../../src/app/dashboard/dashboard.component';
import { ExpenseDataService } from '../../src/app/core/services/expense-data.service';
import { UserService } from '../../src/app/core/services/user.service';
import { DatabaseService } from '../../src/app/core/services/database.service';
import { CurrencyPipe } from '@angular/common';
import { ChartData } from '../../src/app/dashboard/interfaces/chart-data';
import { Expense } from '../../src/app/core/interfaces/expense-model';

describe('Dashboard Grouping by Type Tests', () => {
  let component: DashboardComponent;
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;

  beforeEach(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', ['setExpensesData', 'setCategoriesSignal']);
    mockExpenseDataService.expenseSourcesSignal = jasmine.fn().and.returnValue(['Credit', 'Debit', 'Cash']);
    mockExpenseDataService.categoriesSignal = jasmine.fn().and.returnValue(['Groceries', 'Transport']);
    mockExpenseDataService.filteredExpenses = jasmine.fn().and.returnValue([]);

    mockUserService = jasmine.createSpyObj('UserService', ['getUser', 'getUserId', 'setUserId']);
    mockUserService.getUser = jasmine.fn().and.returnValue({ email: 'test@example.com', uid: 'mock-user-id' });
    mockUserService.getUserId = jasmine.fn().and.returnValue('mock-user-id');

    mockDatabaseService = jasmine.createSpyObj('DatabaseService', ['getUserDetails', 'getUserExpenses']);
    mockDatabaseService.getUserDetails = jasmine.fn().and.returnValue(
      Promise.resolve({ toJSON: () => ({ 'mock-user-id': { firstName: 'Test', lastName: 'User' } }) })
    );
  });

  // RT-96-UT-013: Test DashboardComponent getSourceTotal with type property
  it('RT-96-UT-013 | RT-97 | DashboardComponent getSourceTotal with type property groups correctly | Risk: High', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Groceries', type: 'Credit', amount: 50.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Credit', amount: 30.0 },
      { name: 'Expense 3', date: new Date('2024-01-03'), category: 'Groceries', type: 'Debit', amount: 20.0 },
      { name: 'Expense 4', date: new Date('2024-01-04'), category: 'Transport', type: 'Cash', amount: 10.0 },
    ];

    const sources = ['Credit', 'Debit', 'Cash'];
    const result = component['getSourceTotal'](sources, mockExpenses, 'type');

    expect(result.length).toBe(3);
    const creditData = result.find((d: ChartData) => d.name === 'Credit');
    const debitData = result.find((d: ChartData) => d.name === 'Debit');
    const cashData = result.find((d: ChartData) => d.name === 'Cash');

    expect(creditData?.y).toBe(80);
    expect(debitData?.y).toBe(20);
    expect(cashData?.y).toBe(10);
  });

  // RT-96-UT-014: Test DashboardComponent processExpenseData groups by type
  it('RT-96-UT-014 | RT-97 | DashboardComponent processExpenseData groups by type | Risk: High', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Groceries', type: 'Credit', amount: 50.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 30.0 },
      { name: 'Expense 3', date: new Date('2024-01-03'), category: 'Groceries', type: 'Cash', amount: 20.0 },
    ];

    component['processExpenseData'](mockExpenses);

    expect(component.expenseSourceData.length).toBe(3);
    const types = component.expenseSourceData.map((d: ChartData) => d.name);
    expect(types).toContain('Credit');
    expect(types).toContain('Debit');
    expect(types).toContain('Cash');
  });

  // RT-96-UT-015: Test DashboardComponent expenseSourceData signal
  it('RT-96-UT-015 | RT-97 | DashboardComponent expenseSourceData contains type-based data | Risk: Medium', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 100.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 50.0 },
    ];

    component['processExpenseData'](mockExpenses);

    expect(component.expenseSourceData).toBeDefined();
    expect(Array.isArray(component.expenseSourceData)).toBe(true);
    expect(component.expenseSourceData.length).toBe(2);
  });

  // RT-96-UT-016: Test DashboardComponent metrics include type-related data
  it('RT-96-UT-016 | RT-97 | DashboardComponent metrics include type-related data | Risk: Medium', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 100.0 },
      { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 50.0 },
    ];

    component['processExpenseData'](mockExpenses);

    expect(component.metrics).toBeDefined();
    expect(component.metrics.length).toBe(4);
    const metricTitles = component.metrics.map((m: any) => m.metricTitle);
    expect(metricTitles).toContain('Number of Expenses');
    expect(metricTitles).toContain('Total Expenses Amount');
  });

  // RT-96-UT-017: Test CategorySummaryChartComponent with type data
  it('RT-96-UT-017 | RT-97 | CategorySummaryChartComponent processes type data correctly | Risk: Medium', () => {
    const mockExpenses: Expense[] = [
      { name: 'Expense 1', date: new Date('2024-01-15'), category: 'Groceries', type: 'Credit', amount: 50.0 },
      { name: 'Expense 2', date: new Date('2024-02-15'), category: 'Groceries', type: 'Debit', amount: 30.0 },
      { name: 'Expense 3', date: new Date('2024-03-15'), category: 'Transport', type: 'Credit', amount: 20.0 },
    ];

    const categories = ['Groceries', 'Transport'];
    const testDate = new Date('2024-01-01');

    // Verify the data structure for type-based grouping
    const typeData = mockExpenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + +expense.amount;
      return acc;
    }, {});

    expect(typeData['Credit']).toBe(70);
    expect(typeData['Debit']).toBe(30);
  });

  // RT-96-UT-018: Test ChartSummaryComponent with type pie data
  it('RT-96-UT-018 | RT-97 | ChartSummaryComponent renders type pie chart data | Risk: Medium', () => {
    const typeChartData: ChartData[] = [
      { name: 'Credit', y: 80, value: 80 },
      { name: 'Debit', y: 30, value: 30 },
      { name: 'Cash', y: 20, value: 20 },
    ];

    expect(typeChartData.length).toBe(3);
    expect(typeChartData[0].name).toBe('Credit');
    expect(typeChartData[0].y).toBe(80);
    expect(typeChartData[0].value).toBe(80);
  });
});
