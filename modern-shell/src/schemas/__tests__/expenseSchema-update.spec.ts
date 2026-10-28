import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expenseSchema, EXPENSE_CATEGORIES, ExpenseFormData } from '../expenseSchema';

describe('RT-94 | expenseSchema | Unit | Tier: High', () => {
  const validData: ExpenseFormData = {
    name: 'Coffee',
    amount: 5.5,
    date: '2024-03-15',
    category: 'Food',
    comments: 'Morning coffee',
  };

  describe('RT-94-UT-009: Schema validates complete valid expense data', () => {
    it('should validate a complete valid expense with all fields', () => {
      const result = expenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate without optional comments field', () => {
      const { comments: _, ...withoutComments } = validData;
      const result = expenseSchema.safeParse(withoutComments as any);
      expect(result.success).toBe(true);
    });

    it('should accept empty string comments', () => {
      const result = expenseSchema.safeParse({ ...validData, comments: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('RT-94-UT-010: Schema rejects invalid name', () => {
    it('should reject empty name', () => {
      const result = expenseSchema.safeParse({ ...validData, name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((i) => i.path.includes('name'));
        expect(nameError?.message).toBe('Description is required');
      }
    });

    it('should reject name with less than 1 character', () => {
      const result = expenseSchema.safeParse({ ...validData, name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('RT-94-UT-011: Schema validates amount correctly', () => {
    it('should reject negative amount', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: -10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountError = result.error.issues.find((i) => i.path.includes('amount'));
        expect(amountError?.message).toBe('Amount must be greater than zero');
      }
    });

    it('should reject zero amount', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountError = result.error.issues.find((i) => i.path.includes('amount'));
        expect(amountError?.message).toBe('Amount must be greater than zero');
      }
    });

    it('should reject non-numeric amount', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 'abc' });
      expect(result.success).toBe(false);
    });

    it('should accept decimal amounts', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 99.99 });
      expect(result.success).toBe(true);
    });

    it('should accept large amounts', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 999999.99 });
      expect(result.success).toBe(true);
    });
  });

  describe('RT-94-UT-012: Schema validates date field', () => {
    it('should reject empty date string', () => {
      const result = expenseSchema.safeParse({ ...validData, date: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const dateError = result.error.issues.find((i) => i.path.includes('date'));
        expect(dateError?.message).toBe('Date is required');
      }
    });

    it('should accept valid date string', () => {
      const result = expenseSchema.safeParse({ ...validData, date: '2024-03-15' });
      expect(result.success).toBe(true);
    });

    it('should accept various date formats', () => {
      const dates = ['2024-01-01', '2024-12-31', '2024-06-15'];
      for (const date of dates) {
        const result = expenseSchema.safeParse({ ...validData, date });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('RT-94-UT-013: Schema validates category', () => {
    it('should reject invalid category', () => {
      const result = expenseSchema.safeParse({ ...validData, category: 'InvalidCategory' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const catError = result.error.issues.find((i) => i.path.includes('category'));
        expect(catError?.message).toBe('Please select a category');
      }
    });

    it('should accept all valid categories', () => {
      for (const category of EXPENSE_CATEGORIES) {
        const result = expenseSchema.safeParse({ ...validData, category });
        expect(result.success).toBe(true);
      }
    });

    it('should reject undefined category', () => {
      const result = expenseSchema.safeParse({ ...validData, category: undefined as any });
      expect(result.success).toBe(false);
    });
  });

  describe('RT-94-UT-014: Schema rejects missing required fields', () => {
    it('should reject missing name', () => {
      const { name: _, ...rest } = validData;
      const result = expenseSchema.safeParse(rest as any);
      expect(result.success).toBe(false);
    });

    it('should reject missing amount', () => {
      const { amount: _, ...rest } = validData;
      const result = expenseSchema.safeParse(rest as any);
      expect(result.success).toBe(false);
    });

    it('should reject missing date', () => {
      const { date: _, ...rest } = validData;
      const result = expenseSchema.safeParse(rest as any);
      expect(result.success).toBe(false);
    });

    it('should reject missing category', () => {
      const { category: _, ...rest } = validData;
      const result = expenseSchema.safeParse(rest as any);
      expect(result.success).toBe(false);
    });
  });
});
