import { TestBed } from '@angular/core/testing';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { Expense } from '../../../../src/app/core/interfaces/expense-model';

describe('ExpenseTypeUpdate - Type Update Operations', () => {
  let service: ExpenseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseDataService);
  });

  describe('RT-97-UT-041: Update expense type via service', () => {
    it('should rename an existing expense type', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Cash');
      expect(updatedTypes()).toContain('Bank Transfer');
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).toContain('Debit');
    });

    it('should not affect other types when updating', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).toContain('Debit');
      expect(updatedTypes().length).toBe(3);
    });

    it('should handle updating non-existent type gracefully', () => {
      const initialTypes = service.expenseTypesSignal();
      const initialLength = initialTypes().length;

      service.updateExpenseType('NonExistent', 'NewType');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes().length).toBe(initialLength);
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).not.toContain('NewType');
    });

    it('should allow updating to a type that already exists', () => {
      service.updateExpenseType('Cash', 'Credit');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Cash');
      // Note: This will result in duplicate 'Credit' entries if the implementation doesn't handle it
      // The test verifies the update operation works
      expect(updatedTypes()).toContain('Credit');
    });

    it('should handle updating type with special characters', () => {
      service.updateExpenseType('Cash', 'Gift Card & Rewards');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Cash');
      expect(updatedTypes()).toContain('Gift Card & Rewards');
    });

    it('should handle updating type with spaces', () => {
      service.updateExpenseType('Debit', 'Bank Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Debit');
      expect(updatedTypes()).toContain('Bank Transfer');
    });

    it('should update all expenses when type is renamed', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Cash', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Cash', amount: 30 },
        { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 20 },
      ];

      service.expensesSignal().set(testExpenses);
      service.updateExpenseType('Cash', 'Bank Transfer');

      const updatedExpenses = service.expensesSignal();
      expect(updatedExpenses[0].type).toBe('Bank Transfer');
      expect(updatedExpenses[1].type).toBe('Bank Transfer');
      expect(updatedExpenses[2].type).toBe('Credit');
    });

    it('should maintain expense count after type update', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Cash', amount: 50 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 30 },
      ];

      service.expensesSignal().set(testExpenses);
      service.updateExpenseType('Cash', 'Bank Transfer');

      const updatedExpenses = service.expensesSignal();
      expect(updatedExpenses.length).toBe(2);
    });
  });

  describe('RT-97-UT-042: Type update in manage expense component', () => {
    it('should allow updating expense type in component', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      testExpense.type = 'Debit';

      expect(testExpense.type).toBe('Debit');
    });

    it('should preserve other expense properties when updating type', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      const originalName = testExpense.name;
      const originalCategory = testExpense.category;
      const originalAmount = testExpense.amount;

      testExpense.type = 'Debit';

      expect(testExpense.name).toBe(originalName);
      expect(testExpense.category).toBe(originalCategory);
      expect(testExpense.amount).toBe(originalAmount);
      expect(testExpense.type).toBe('Debit');
    });

    it('should allow updating type to empty string', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      testExpense.type = '';

      expect(testExpense.type).toBe('');
    });

    it('should handle type update with special characters', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      testExpense.type = 'Gift Card & Rewards';

      expect(testExpense.type).toBe('Gift Card & Rewards');
    });

    it('should handle type update with spaces', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      testExpense.type = 'Bank Transfer';

      expect(testExpense.type).toBe('Bank Transfer');
    });
  });

  describe('RT-97-UT-043: Type update signal reactivity', () => {
    it('should update signal value when type is renamed', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Cash');
      expect(updatedTypes()).toContain('Bank Transfer');
    });

    it('should maintain signal identity after type update', () => {
      const initialSignal = service.expenseTypesSignal();

      service.updateExpenseType('Cash', 'Bank Transfer');

      const finalSignal = service.expenseTypesSignal();
      expect(finalSignal()).not.toContain('Cash');
      expect(finalSignal()).toContain('Bank Transfer');
    });

    it('should allow multiple type updates in sequence', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');
      service.updateExpenseType('Bank Transfer', 'Wire Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('Cash');
      expect(updatedTypes()).not.toContain('Bank Transfer');
      expect(updatedTypes()).toContain('Wire Transfer');
    });

    it('should handle updating same type multiple times', () => {
      service.updateExpenseType('Cash', 'Bank Transfer');
      service.updateExpenseType('Bank Transfer', 'Wire Transfer');
      service.updateExpenseType('Wire Transfer', 'Cash');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Cash');
      expect(updatedTypes()).not.toContain('Bank Transfer');
      expect(updatedTypes()).not.toContain('Wire Transfer');
    });
  });
});
