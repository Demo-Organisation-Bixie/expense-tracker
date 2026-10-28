import { TestBed } from '@angular/core/testing';
import { ExpenseDataService } from './expense-data.service';
import { Expense } from '@core/interfaces/expense-model';

describe('ExpenseDataService - Update Operations', () => {
  let service: ExpenseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseDataService);
  });

  describe('RT-94-UT-015: Service signal accessors', () => {
    it('should return writable expenses signal', () => {
      const signal = service.expensesSignal;
      expect(signal).toBeDefined();
      expect(typeof signal).toBe('function');
    });

    it('should return writable source types signal', () => {
      const signal = service.expenseSourcesSignal;
      expect(signal).toBeDefined();
    });

    it('should return writable categories signal', () => {
      const signal = service.categoriesSignal;
      expect(signal).toBeDefined();
    });

    it('should return writable time frame filter signal', () => {
      const signal = service.timeFrameFilterSignal;
      expect(signal).toBeDefined();
    });
  });

  describe('RT-94-UT-016: Expense signal state management', () => {
    it('should start with empty expenses array', () => {
      expect(service.expensesSignal()).toEqual([]);
    });

    it('should allow setting expenses via signal', () => {
      const testExpenses: Expense[] = [
        { name: 'Coffee', amount: 5.5, date: new Date(), category: 'Food', type: 'Cash' },
      ];
      service.expensesSignal().push(...testExpenses);
      expect(service.expensesSignal().length).toBe(1);
    });

    it('should allow setting categories via signal', () => {
      service.categoriesSignal().push('Food', 'Transport');
      expect(service.categoriesSignal()).toContain('Food');
      expect(service.categoriesSignal()).toContain('Transport');
    });

    it('should allow setting source types via signal', () => {
      service.expenseSourcesSignal().push('Cash', 'Card');
      expect(service.expenseSourcesSignal()).toContain('Cash');
      expect(service.expenseSourcesSignal()).toContain('Card');
    });
  });

  describe('RT-94-UT-017: Filtered expenses computed signal', () => {
    it('should return all expenses when no filter is applied', () => {
      const testExpenses: Expense[] = [
        { name: 'Coffee', amount: 5.5, date: new Date(), category: 'Food', type: 'Cash' },
        { name: 'Bus', amount: 2.0, date: new Date(), category: 'Transport', type: 'Card' },
      ];
      service.expensesSignal().push(...testExpenses);
      expect(service.filteredExpenses().length).toBe(2);
    });

    it('should return empty array when expenses signal is empty', () => {
      expect(service.filteredExpenses().length).toBe(0);
    });

    it('should respect custom date range filter', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      service.timeFrameFilterSignal().set({
        customDateRange: { start: yesterday, end: tomorrow },
      });

      const recentExpense: Expense = {
        name: 'Coffee',
        amount: 5.5,
        date: now,
        category: 'Food',
        type: 'Cash',
      };
      const oldExpense: Expense = {
        name: 'Old Expense',
        amount: 10,
        date: new Date('2020-01-01'),
        category: 'Food',
        type: 'Cash',
      };

      service.expensesSignal().push(recentExpense, oldExpense);

      const filtered = service.filteredExpenses();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Coffee');
    });

    it('should handle undefined time frame filter', () => {
      service.timeFrameFilterSignal().set(undefined);
      const testExpense: Expense = {
        name: 'Coffee',
        amount: 5.5,
        date: new Date(),
        category: 'Food',
        type: 'Cash',
      };
      service.expensesSignal().push(testExpense);
      expect(service.filteredExpenses().length).toBe(1);
    });
  });

  describe('RT-94-UT-018: Files imported signal', () => {
    it('should start with empty files imported array', () => {
      expect(service.filesImportedSignal()).toEqual([]);
    });

    it('should allow setting files imported via signal', () => {
      service.filesImportedSignal().push('file1.csv', 'file2.csv');
      expect(service.filesImportedSignal()).toContain('file1.csv');
    });
  });

  describe('RT-94-UT-019: Expense entry type filter', () => {
    it('should start with undefined entry type filter', () => {
      expect(service.expenseEntryTypeFilterSignal()).toBeUndefined();
    });

    it('should allow setting entry type filter', () => {
      service.expenseEntryTypeFilterSignal().set('Manual');
      expect(service.expenseEntryTypeFilterSignal()).toBe('Manual');
    });
  });

  describe('RT-94-UT-020: Show filters signal', () => {
    it('should start with false', () => {
      expect(service.showFiltersSignal()).toBe(false);
    });

    it('should allow toggling show filters', () => {
      service.showFiltersSignal().set(true);
      expect(service.showFiltersSignal()).toBe(true);
      service.showFiltersSignal().set(false);
      expect(service.showFiltersSignal()).toBe(false);
    });
  });
});
