import { TestBed } from '@angular/core/testing';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { Expense } from '../../../../src/app/core/interfaces/expense-model';
import { EntryTypes } from '../../../../src/app/core/enums/entry-types';

describe('ExpenseModelAndDataService - Type Grouping Logic', () => {
  let service: ExpenseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseDataService);
  });

  describe('RT-97-UT-001: expenseTypesSignal returns type values', () => {
    it('should return expense types signal', () => {
      const types = service.expenseTypesSignal();
      expect(types).toBeDefined();
      expect(Array.isArray(types)).toBe(true);
    });

    it('should return default expense types', () => {
      const types = service.expenseTypesSignal();
      expect(types).toContain('Credit');
      expect(types).toContain('Debit');
      expect(types).toContain('Cash');
    });
  });

  describe('RT-97-UT-002: categoriesSignal returns category values', () => {
    it('should return categories signal', () => {
      const categories = service.categoriesSignal();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should return empty array by default', () => {
      const categories = service.categoriesSignal();
      expect(categories.length).toBe(0);
    });
  });

  describe('RT-97-UT-003: expensesSignal contains type field', () => {
    it('should return expenses signal', () => {
      const expenses = service.expensesSignal();
      expect(expenses).toBeDefined();
      expect(Array.isArray(expenses)).toBe(true);
    });

    it('should return empty array by default', () => {
      const expenses = service.expensesSignal();
      expect(expenses.length).toBe(0);
    });

    it('should allow setting expenses with type field', () => {
      const testExpenses: Expense[] = [
        {
          name: 'Test Expense 1',
          date: new Date(),
          category: 'Groceries',
          type: 'Credit',
          amount: 50,
        },
        {
          name: 'Test Expense 2',
          date: new Date(),
          category: 'Transportation',
          type: 'Debit',
          amount: 30,
        },
      ];

      service.expensesSignal().set(testExpenses);
      const retrieved = service.expensesSignal();

      expect(retrieved.length).toBe(2);
      expect(retrieved[0].type).toBe('Credit');
      expect(retrieved[1].type).toBe('Debit');
    });
  });

  describe('RT-97-UT-004: filterExpensesByEntryType groups by manual vs imported', () => {
    it('should return all expenses when no entry type filter is set', () => {
      const testExpenses: Expense[] = [
        { name: 'Manual', date: new Date(), category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'Imported', date: new Date(), category: 'Food', type: 'Cash', amount: 20, importedOn: new Date() },
      ];
      service.expensesSignal().set(testExpenses);

      const result = service['filterExpensesByEntryType'](testExpenses, undefined);
      expect(result.length).toBe(2);
    });

    it('should return only manual expenses when MANUAL filter is set', () => {
      const testExpenses: Expense[] = [
        { name: 'Manual 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'Manual 2', date: new Date(), category: 'Food', type: 'Debit', amount: 20 },
        { name: 'Imported', date: new Date(), category: 'Food', type: 'Cash', amount: 30, importedOn: new Date() },
      ];

      const result = service['filterExpensesByEntryType'](testExpenses, EntryTypes.MANUAL);
      expect(result.length).toBe(2);
      result.forEach((exp) => {
        expect(exp.importedOn).toBeUndefined();
      });
    });

    it('should return only imported expenses when IMPORTED filter is set', () => {
      const testExpenses: Expense[] = [
        { name: 'Manual', date: new Date(), category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'Imported 1', date: new Date(), category: 'Food', type: 'Cash', amount: 20, importedOn: new Date() },
        { name: 'Imported 2', date: new Date(), category: 'Transport', type: 'Debit', amount: 30, importedOn: new Date() },
      ];

      const result = service['filterExpensesByEntryType'](testExpenses, EntryTypes.IMPORTED);
      expect(result.length).toBe(2);
      result.forEach((exp) => {
        expect(exp.importedOn).toBeDefined();
      });
    });
  });

  describe('RT-97-UT-005: filteredExpenses computed signal', () => {
    it('should return filtered expenses based on time frame', () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const futureDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const testExpenses: Expense[] = [
        { name: 'Past', date: lastMonth, category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'Future', date: futureDate, category: 'Food', type: 'Debit', amount: 20 },
      ];
      service.expensesSignal().set(testExpenses);

      const filtered = service.filteredExpenses();
      expect(Array.isArray(filtered)).toBe(true);
    });

    it('should return all expenses when no filters are applied', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 20 },
      ];
      service.expensesSignal().set(testExpenses);

      const filtered = service.filteredExpenses();
      expect(filtered.length).toBe(2);
    });
  });

  describe('RT-97-UT-006: parseExpenseDate handles Date and string', () => {
    it('should parse Date objects', () => {
      const dateObj = new Date();
      const expense: Expense = { name: 'Test', date: dateObj, category: 'Groceries', type: 'Credit', amount: 10 };
      const result = service['parseExpenseDate'](expense);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(dateObj.getTime());
    });

    it('should parse string dates', () => {
      const dateString = '2024-01-15';
      const expense: Expense = { name: 'Test', date: dateString, category: 'Groceries', type: 'Credit', amount: 10 };
      const result = service['parseExpenseDate'](expense);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString().substring(0, 10)).toBe(dateString);
    });
  });

  describe('RT-97-UT-007: timeFrameFilterSignal controls filtering', () => {
    it('should return undefined by default', () => {
      const filter = service.timeFrameFilterSignal();
      expect(filter).toBeUndefined();
    });

    it('should allow setting time frame filter', () => {
      const filter = {
        customDateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
      };
      service.timeFrameFilterSignal().set(filter);
      expect(service.timeFrameFilterSignal()).toEqual(filter);
    });
  });

  describe('RT-97-UT-008: filesImportedSignal tracks imported files', () => {
    it('should return empty array by default', () => {
      const files = service.filesImportedSignal();
      expect(files).toBeDefined();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBe(0);
    });

    it('should allow setting imported files', () => {
      const testFiles = ['file1.csv', 'file2.xlsx'];
      service.filesImportedSignal().set(testFiles);
      expect(service.filesImportedSignal()).toEqual(testFiles);
    });
  });

  describe('RT-97-UT-009: expenseEntryTypeFilter controls entry type display', () => {
    it('should return undefined by default', () => {
      const filter = service.expenseEntryTypeFilter();
      expect(filter).toBeUndefined();
    });

    it('should allow setting entry type filter', () => {
      service.expenseEntryTypeFilter().set(EntryTypes.MANUAL);
      expect(service.expenseEntryTypeFilter()).toBe(EntryTypes.MANUAL);
    });
  });

  describe('RT-97-UT-012: groupExpensesByType groups expenses by type', () => {
    it('should group expenses by their type field', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 30 },
        { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 20 },
        { name: 'Expense 4', date: new Date(), category: 'Entertainment', type: 'Cash', amount: 15 },
      ];

      const result = service.groupExpensesByType(testExpenses);

      expect(result.size).toBe(3);
      expect(result.get('Credit')).toHaveLength(2);
      expect(result.get('Debit')).toHaveLength(1);
      expect(result.get('Cash')).toHaveLength(1);
    });

    it('should use "Uncategorized" for expenses without type', () => {
      const testExpenses: Expense[] = [
        { name: 'No Type', date: new Date(), category: 'Groceries', type: '', amount: 10 },
        { name: 'With Type', date: new Date(), category: 'Food', type: 'Credit', amount: 20 },
      ];

      const result = service.groupExpensesByType(testExpenses);

      expect(result.size).toBe(2);
      expect(result.get('Uncategorized')).toHaveLength(1);
      expect(result.get('Credit')).toHaveLength(1);
    });

    it('should return empty map for empty input', () => {
      const result = service.groupExpensesByType([]);
      expect(result.size).toBe(0);
    });
  });

  describe('RT-97-UT-013: addExpenseType adds new type', () => {
    it('should add a new expense type to the signal', () => {
      const initialTypes = service.expenseTypesSignal();
      expect(initialTypes).toContain('Credit');

      service.addExpenseType('PayPal');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes).toContain('PayPal');
      expect(updatedTypes.length).toBeGreaterThan(initialTypes.length);
    });

    it('should not add duplicate types', () => {
      const initialTypes = service.expenseTypesSignal();
      const initialLength = initialTypes.length;

      service.addExpenseType('Credit');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes.length).toBe(initialLength);
      expect(updatedTypes).toContain('Credit');
    });
  });

  describe('RT-97-UT-014: removeExpenseType removes existing type', () => {
    it('should remove an expense type from the signal', () => {
      service.addExpenseType('PayPal');
      expect(service.expenseTypesSignal()).toContain('PayPal');

      service.removeExpenseType('PayPal');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes).not.toContain('PayPal');
    });

    it('should not affect other types when removing', () => {
      service.addExpenseType('PayPal');
      service.removeExpenseType('PayPal');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes).toContain('Credit');
      expect(updatedTypes).toContain('Debit');
      expect(updatedTypes).toContain('Cash');
    });

    it('should handle removing non-existent type gracefully', () => {
      const initialTypes = service.expenseTypesSignal();
      service.removeExpenseType('NonExistent');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes.length).toBe(initialTypes.length);
    });
  });

  describe('RT-97-UT-015: updateExpenseType renames existing type', () => {
    it('should update an existing expense type', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes).not.toContain('Cash');
      expect(updatedTypes).toContain('Bank Transfer');
      expect(updatedTypes).toContain('Credit');
      expect(updatedTypes).toContain('Debit');
    });

    it('should not affect other types when updating', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes).toContain('Credit');
      expect(updatedTypes).toContain('Debit');
    });

    it('should handle updating non-existent type gracefully', () => {
      const initialTypes = service.expenseTypesSignal();
      service.updateExpenseType('NonExistent', 'NewType');
      const updatedTypes = service.expenseTypesSignal();

      expect(updatedTypes.length).toBe(initialTypes.length);
      expect(updatedTypes).toContain('Credit');
    });
  });

  describe('RT-97-UT-016: Type filtering in expense list (R5)', () => {
    it('should filter expenses by type in the list', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 30 },
        { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 20 },
      ];

      service.expensesSignal().set(testExpenses);
      service.setTypeFilter('Credit');

      const filtered = service.filteredExpenses();
      expect(filtered.length).toBe(2);
      filtered.forEach((exp) => {
        expect(exp.type).toBe('Credit');
      });
    });

    it('should return all expenses when no type filter is set', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 30 },
      ];

      service.expensesSignal().set(testExpenses);
      service.setTypeFilter(undefined);

      const filtered = service.filteredExpenses();
      expect(filtered.length).toBe(2);
    });

    it('should group and filter expenses together', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 30 },
        { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 20 },
      ];

      service.expensesSignal().set(testExpenses);
      service.setTypeFilter('Credit');

      const filtered = service.filteredExpenses();
      const grouped = service.groupExpensesByType(filtered);

      expect(filtered.length).toBe(2);
      expect(grouped.size).toBe(1);
      expect(grouped.get('Credit')).toHaveLength(2);
    });
  });
});
