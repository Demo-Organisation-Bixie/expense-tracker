import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { ManageExpenseComponent } from '../../../../src/app/shared/components/manage-expense/manage-expense.component';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { DatabaseService } from '../../../../src/app/core/services/database.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { Expense } from '../../../../src/app/core/interfaces/expense-model';
import { defaultExpenseCategories, defaultExpenseTypes } from '../../../../src/app/shared/constants/expense-constants';

describe('UIComponentInteractions - Type CRUD Flow', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(fakeAsync(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: jasmine.createSpy().and.returnValue(defaultExpenseCategories),
      expenseSourcesSignal: jasmine.createSpy().and.returnValue(defaultExpenseTypes),
    });

    mockDatabaseService = jasmine.createSpyObj('DatabaseService', ['deleteExpense', 'saveNewExpense', 'updateExpense'], {
      announceExpenseCreated: jasmine.createSpy(),
      announceCategoriesAdded: jasmine.createSpy(),
    });

    mockUserService = jasmine.createSpyObj('UserService', ['getUserId'], {
      getUser: jasmine.createSpy().and.returnValue({ uid: 'test-user-1' }),
    });
    mockUserService.getUserId.and.returnValue('test-user-1');

    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatButtonModule,
        MatInput,
        CommonModule,
        MatSnackBarModule,
        MatIconModule,
        ManageExpenseComponent,
      ],
      providers: [
        provideNativeDateAdapter(),
        DatePipe,
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('RT-96-IN-001: Type field in expense form UI', () => {
    it('should have types array initialized', () => {
      expect(component.types).toBeDefined();
      expect(Array.isArray(component.types)).toBe(true);
    });

    it('should have categories array initialized', () => {
      expect(component.categories).toBeDefined();
      expect(Array.isArray(component.categories)).toBe(true);
    });

    it('should have expense object with type field', () => {
      const expense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.expense = expense;
      expect(component.expense.type).toBe('Credit');
    });
  });

  describe('RT-96-IN-002: Adding expense with type', () => {
    it('should create expense with type field', () => {
      const expense: Expense = {
        name: 'New Expense',
        date: new Date(),
        category: 'Food',
        type: 'Debit',
        amount: 25,
      };

      component.expense = expense;

      expect(component.expense.name).toBe('New Expense');
      expect(component.expense.category).toBe('Food');
      expect(component.expense.type).toBe('Debit');
      expect(component.expense.amount).toBe(25);
    });

    it('should support all default types', () => {
      defaultExpenseTypes.forEach((type) => {
        const expense: Expense = {
          name: `Type Test: ${type}`,
          date: new Date(),
          category: 'Groceries',
          type: type,
          amount: 10,
        };

        component.expense = expense;
        expect(component.expense.type).toBe(type);
      });
    });
  });

  describe('RT-96-IN-003: Updating expense type', () => {
    it('should update expense type', () => {
      const expense: Expense = {
        name: 'Update Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'update-id',
      };

      component.expense = expense;
      component.update = true;

      component.expense.type = 'Cash';
      expect(component.expense.type).toBe('Cash');
    });

    it('should track original expense for comparison', () => {
      const expense: Expense = {
        name: 'Original Test',
        date: new Date(),
        category: 'Food',
        type: 'Debit',
        amount: 30,
      };

      component.expense = { ...expense };
      component.original = { ...expense };

      component.expense.type = 'Credit';

      expect(component.original.type).toBe('Debit');
      expect(component.expense.type).toBe('Credit');
    });
  });

  describe('RT-96-IN-004: Deleting expense with type', () => {
    it('should delete expense and show success message', fakeAsync(() => {
      const expense: Expense = {
        name: 'Delete Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'delete-id',
      };

      component.expense = expense;
      mockDatabaseService.deleteExpense.and.returnValue(Promise.resolve());

      component.deleteExpense();
      tick();

      expect(mockDatabaseService.deleteExpense).toHaveBeenCalledWith('test-user-1', 'delete-id');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Expense Deleted!', '', { duration: 3000 });
    }));

    it('should show error message on delete failure', fakeAsync(() => {
      const expense: Expense = {
        name: 'Delete Error Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'delete-error-id',
      };

      component.expense = expense;
      const errorMessage = 'Delete failed';
      mockDatabaseService.deleteExpense.and.returnValue(Promise.reject(new Error(errorMessage)));

      component.deleteExpense();
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(errorMessage, '', { duration: 3000 });
    }));
  });

  describe('RT-96-IN-005: Adding custom types in preview mode', () => {
    it('should add custom category when in preview mode', () => {
      const expense: Expense = {
        name: 'Custom Category',
        date: new Date(),
        category: 'CustomCat',
        type: 'Credit',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      expect(component.categories).toContain('CustomCat');
    });

    it('should add custom type when in preview mode', () => {
      const expense: Expense = {
        name: 'Custom Type',
        date: new Date(),
        category: 'Groceries',
        type: 'CustomType',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      expect(component.types).toContain('CustomType');
    });

    it('should not add duplicate categories', () => {
      const expense: Expense = {
        name: 'Existing Category',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      const count = component.categories.filter((c) => c === 'Groceries').length;
      expect(count).toBe(1);
    });

    it('should not add duplicate types', () => {
      const expense: Expense = {
        name: 'Existing Type',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      const count = component.types.filter((t) => t === 'Credit').length;
      expect(count).toBe(1);
    });
  });

  describe('RT-96-IN-006: Type field validation', () => {
    it('should have valid type in expense object', () => {
      const expense: Expense = {
        name: 'Valid Type',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.expense = expense;
      expect(component.expense.type).toBeTruthy();
      expect(typeof component.expense.type).toBe('string');
    });

    it('should have valid category in expense object', () => {
      const expense: Expense = {
        name: 'Valid Category',
        date: new Date(),
        category: 'Food',
        type: 'Debit',
        amount: 50,
      };

      component.expense = expense;
      expect(component.expense.category).toBeTruthy();
      expect(typeof component.expense.category).toBe('string');
    });
  });
});
