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

describe('ExpenseSettingsAndManageOptions - Type Field in Expense Form', () => {
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

  describe('RT-96-UT-007: Type field availability in manage expense dialog', () => {
    it('should initialize with default expense types', () => {
      expect(component.types).toBeDefined();
      expect(Array.isArray(component.types)).toBe(true);
      expect(component.types.length).toBeGreaterThan(0);
    });

    it('should contain default expense types', () => {
      expect(component.types).toContain('Credit');
      expect(component.types).toContain('Debit');
      expect(component.types).toContain('Cash');
    });

    it('should have types populated from expense data service', () => {
      expect(component.types.length).toBe(defaultExpenseTypes.length);
    });
  });

  describe('RT-96-UT-008: Type field in expense form', () => {
    it('should have expense object with type field', () => {
      const expense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.expense = expense;
      component.original = { ...expense };

      expect(component.expense.type).toBe('Credit');
    });

    it('should allow updating expense type', () => {
      const expense: Expense = {
        name: 'Test Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 100,
      };

      component.expense = expense;
      component.expense.type = 'Debit';

      expect(component.expense.type).toBe('Debit');
    });

    it('should have type field in expense object properties', () => {
      const expense: Expense = {
        name: 'Test',
        date: new Date(),
        category: 'Food',
        type: 'Cash',
        amount: 50,
      };

      component.expense = expense;

      expect(component.expense.name).toBeDefined();
      expect(component.expense.date).toBeDefined();
      expect(component.expense.category).toBeDefined();
      expect(component.expense.type).toBeDefined();
      expect(component.expense.amount).toBeDefined();
    });
  });

  describe('RT-96-UT-009: Category and type management', () => {
    it('should have categories populated from service', () => {
      expect(component.categories).toBeDefined();
      expect(Array.isArray(component.categories)).toBe(true);
      expect(component.categories.length).toBeGreaterThan(0);
    });

    it('should contain default expense categories', () => {
      expect(component.categories).toContain('Groceries');
      expect(component.categories).toContain('Transportation');
      expect(component.categories).toContain('Entertainment');
    });

    it('should allow adding custom category in preview mode', () => {
      const expense: Expense = {
        name: 'Custom Category Expense',
        date: new Date(),
        category: 'CustomCategory',
        type: 'Credit',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      expect(component.categories).toContain('CustomCategory');
    });

    it('should allow adding custom type in preview mode', () => {
      const expense: Expense = {
        name: 'Custom Type Expense',
        date: new Date(),
        category: 'Groceries',
        type: 'CustomType',
        amount: 100,
      };

      component.data = { expense, previewDataMode: true };
      component.ngOnInit();

      expect(component.types).toContain('CustomType');
    });
  });

  describe('RT-96-UT-010: Delete expense functionality', () => {
    it('should call deleteExpense on database service', fakeAsync(() => {
      const expense: Expense = {
        name: 'Delete Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'delete-test-id',
      };

      component.expense = expense;
      component.deleteExpense();

      tick();

      expect(mockDatabaseService.deleteExpense).toHaveBeenCalledWith('test-user-1', 'delete-test-id');
    }));

    it('should show success snack bar on delete', fakeAsync(() => {
      const expense: Expense = {
        name: 'Delete Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'delete-test-id',
      };

      component.expense = expense;
      mockDatabaseService.deleteExpense.and.returnValue(Promise.resolve());

      component.deleteExpense();
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Expense Deleted!', '', { duration: 3000 });
    }));
  });

  describe('RT-96-UT-011: Update expense functionality', () => {
    it('should call updateExpense on database service', fakeAsync(() => {
      const expense: Expense = {
        name: 'Update Test',
        date: new Date(),
        category: 'Groceries',
        type: 'Credit',
        amount: 50,
        id: 'update-test-id',
      };

      component.expense = expense;
      component.update = true;
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());

      component.pushUpdate();
      tick();

      expect(mockDatabaseService.updateExpense).toHaveBeenCalledWith('test-user-1', 'update-test-id', jasmine.objectContaining({
        type: 'Credit',
      }));
    }));
  });
});
