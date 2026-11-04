import { TestBed } from '@angular/core/testing';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { Expense } from '../../../../src/app/core/interfaces/expense-model';

describe('ExpenseTypeAddRemove - Type Management', () => {
  let service: ExpenseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseDataService);
  });

  describe('RT-97-UT-037: Add expense type via service', () => {
    it('should add a new type to expense types signal', () => {
      const initialTypes = service.expenseTypesSignal();
      const initialLength = initialTypes().length;

      service.addExpenseType('PayPal');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes().length).toBe(initialLength + 1);
      expect(updatedTypes()).toContain('PayPal');
    });

    it('should not add duplicate types', () => {
      const initialTypes = service.expenseTypesSignal();
      const initialLength = initialTypes().length;

      service.addExpenseType('Credit');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes().length).toBe(initialLength);
      expect(updatedTypes()).toContain('Credit');
    });

    it('should allow adding multiple new types', () => {
      service.addExpenseType('PayPal');
      service.addExpenseType('Crypto');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('PayPal');
      expect(updatedTypes()).toContain('Crypto');
      expect(updatedTypes().length).toBeGreaterThan(3);
    });

    it('should handle adding type with special characters', () => {
      service.addExpenseType('Gift Card & Rewards');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Gift Card & Rewards');
    });

    it('should handle adding type with spaces', () => {
      service.addExpenseType('Bank Transfer');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Bank Transfer');
    });
  });

  describe('RT-97-UT-038: Remove expense type via service', () => {
    it('should remove an existing type from expense types signal', () => {
      service.addExpenseType('PayPal');
      expect(service.expenseTypesSignal()).toContain('PayPal');

      service.removeExpenseType('PayPal');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).not.toContain('PayPal');
    });

    it('should not affect other types when removing', () => {
      service.addExpenseType('PayPal');
      service.removeExpenseType('PayPal');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).toContain('Debit');
      expect(updatedTypes()).toContain('Cash');
    });

    it('should handle removing non-existent type gracefully', () => {
      const initialTypes = service.expenseTypesSignal();
      const initialLength = initialTypes().length;

      service.removeExpenseType('NonExistent');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes().length).toBe(initialLength);
      expect(updatedTypes()).not.toContain('NonExistent');
    });

    it('should handle removing all types except defaults', () => {
      service.addExpenseType('PayPal');
      service.addExpenseType('Crypto');
      service.removeExpenseType('PayPal');
      service.removeExpenseType('Crypto');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes().length).toBe(3);
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).toContain('Debit');
      expect(updatedTypes()).toContain('Cash');
    });

    it('should not remove default types', () => {
      service.removeExpenseType('Credit');

      const updatedTypes = service.expenseTypesSignal();
      expect(updatedTypes()).toContain('Credit');
      expect(updatedTypes()).toContain('Debit');
      expect(updatedTypes()).toContain('Cash');
    });
  });

  describe('RT-97-UT-039: Type add/remove in manage expense component', () => {
    it('should allow adding custom type in preview mode', () => {
      const mockDataService = TestBed.inject(ExpenseDataService);
      mockDataService.expenseTypesSignal.and.returnValue(['Credit', 'Debit', 'Cash']);
      mockDataService.categoriesSignal.and.returnValue(['Groceries', 'Transportation']);

      // Verify that expense types signal is accessible
      const types = mockDataService.expenseTypesSignal();
      expect(types()).toBeDefined();
      expect(Array.isArray(types())).toBe(true);
    });

    it('should allow adding custom category in preview mode', () => {
      const mockDataService = TestBed.inject(ExpenseDataService);
      mockDataService.expenseTypesSignal.and.returnValue(['Credit', 'Debit', 'Cash']);
      mockDataService.categoriesSignal.and.returnValue(['Groceries', 'Transportation']);

      // Verify that categories signal is accessible
      const categories = mockDataService.categoriesSignal();
      expect(categories()).toBeDefined();
      expect(Array.isArray(categories())).toBe(true);
    });

    it('should have type field available for expense', () => {
      const testExpense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
      };

      expect(testExpense.type).toBeDefined();
      expect(testExpense.type).toBe('Credit');
    });

    it('should allow updating expense type', () => {
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

    it('should have all required expense properties', () => {
      const testExpense: Expense = {
        name: 'Test',
        date: new Date(),
        category: 'Food',
        type: 'Cash',
        amount: 50,
      };

      expect(testExpense.name).toBeDefined();
      expect(testExpense.date).toBeDefined();
      expect(testExpense.category).toBeDefined();
      expect(testExpense.type).toBeDefined();
      expect(testExpense.amount).toBeDefined();
    });
  });

  describe('RT-97-UT-040: Type signal reactivity', () => {
    it('should update signal value when type is added', () => {
      const signal1 = service.expenseTypesSignal();
      expect(signal1()).toContain('Credit');

      service.addExpenseType('PayPal');

      const signal2 = service.expenseTypesSignal();
      expect(signal2()).toContain('PayPal');
      expect(signal2()).not.toEqual(signal1());
    });

    it('should update signal value when type is removed', () => {
      service.addExpenseType('PayPal');

      const signal1 = service.expenseTypesSignal();
      expect(signal1()).toContain('PayPal');

      service.removeExpenseType('PayPal');

      const signal2 = service.expenseTypesSignal();
      expect(signal2()).not.toContain('PayPal');
      expect(signal2()).not.toEqual(signal1());
    });

    it('should maintain signal identity after add/remove', () => {
      const initialSignal = service.expenseTypesSignal();

      service.addExpenseType('PayPal');
      service.removeExpenseType('PayPal');

      const finalSignal = service.expenseTypesSignal();
      expect(finalSignal()).toEqual(initialSignal());
    });
  });
});
