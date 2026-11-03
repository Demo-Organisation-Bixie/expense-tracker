import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';

import { ManageExpenseComponent } from './manage-expense.component';
import { Expense } from '@core/interfaces/expense-model';
import { DatabaseService } from '@core/services/database.service';
import { ExpenseDataService } from '@core/services/expense-data.service';
import { UserService } from '@core/services/user.service';
import { ManageExpenseData } from '../../interfaces/manage-expense-data';

describe('ManageExpenseComponent - Update Flow', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;
  let mockDatabaseService: any;
  let mockExpenseDataService: any;
  let mockUserService: any;
  let mockSnackBar: any;
  let mockDialogRef: any;

  const mockExpense: Expense = {
    id: 'expense-update-1',
    name: 'Coffee',
    amount: 5.5,
    date: new Date('2024-03-15'),
    category: 'Food',
    type: 'Cash',
    comments: 'Morning coffee',
  };

  const mockDialogData: ManageExpenseData = {
    expense: mockExpense,
    update: true,
    previewDataMode: false,
  };

  beforeEach(fakeAsync(() => {
    const databaseSpy = jasmine.createSpyObj('DatabaseService', ['updateExpense', 'deleteExpense']);
    const expenseDataServiceSpy = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: jasmine.createSpy().and.returnValue(['Food', 'Transport', 'Shopping']),
      expenseSourcesSignal: jasmine.createSpy().and.returnValue(['Cash', 'Card', 'UPI']),
    });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserId'], { userId$: of('user-123') });
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
      ],
      declarations: [ManageExpenseComponent],
      providers: [
        provideNativeDateAdapter(),
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: DatabaseService, useValue: databaseSpy },
        { provide: ExpenseDataService, useValue: expenseDataServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    mockDatabaseService = TestBed.inject(DatabaseService);
    mockExpenseDataService = TestBed.inject(ExpenseDataService);
    mockUserService = TestBed.inject(UserService);
    mockSnackBar = TestBed.inject(MatSnackBar);
    mockDialogRef = TestBed.inject(MatDialogRef);

    mockUserService.getUserId.and.returnValue('user-123');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  describe('RT-94-UT-001: Component initialization with existing expense', () => {
    it('should initialize with existing expense data', () => {
      expect(component.expense).toBeDefined();
      expect(component.expense.name).toBe('Coffee');
      expect(component.expense.amount).toBe(5.5);
      expect(component.expense.category).toBe('Food');
      expect(component.expense.type).toBe('Cash');
    });

    it('should set update flag to true when update is true in data', () => {
      expect(component.update).toBe(true);
    });

    it('should store original expense for comparison', () => {
      expect(component.original).toBeDefined();
      expect(component.original.name).toBe('Coffee');
    });

    it('should populate categories from ExpenseDataService', () => {
      expect(component.categories).toContain('Food');
      expect(component.categories).toContain('Transport');
    });

    it('should populate types from ExpenseDataService', () => {
      expect(component.types).toContain('Cash');
      expect(component.types).toContain('Card');
    });
  });

  describe('RT-94-UT-002: Update expense with valid data', () => {
    it('should call database.updateExpense with correct parameters', fakeAsync(() => {
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());

      component.expense.name = 'Updated Coffee';
      component.expense.amount = 7.5;
      component.expense.category = 'Transport';
      component.expense.type = 'Card';
      component.expense.comments = 'Updated comment';

      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).toHaveBeenCalledWith(
        'user-123',
        'expense-update-1',
        jasmine.objectContaining({
          name: 'Updated Coffee',
          amount: 7.5,
          category: 'Transport',
          type: 'Card',
          comments: 'Updated comment',
        }),
      );
    }));

    it('should close dialog with "Successful" on update success', fakeAsync(() => {
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());

      component.expense.name = 'Updated Coffee';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDialogRef.close).toHaveBeenCalledWith('Successful');
    }));

    it('should show success snackbar on update success', fakeAsync(() => {
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());

      component.expense.name = 'Updated Coffee';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Expense Updated!', '', jasmine.objectContaining({ duration: 3000 }));
    }));
  });

  describe('RT-94-UT-003: Update expense with invalid data', () => {
    it('should not call update when valid is false', () => {
      component.expense.name = '';
      component.updateExpense(false);

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    });

    it('should not call update when valid is null', () => {
      component.expense.name = '';
      component.updateExpense(null);

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    });
  });

  describe('RT-94-UT-004: Update expense with validation errors', () => {
    it('should show error snackbar when update fails', fakeAsync(() => {
      const error = new Error('Update failed');
      mockDatabaseService.updateExpense.and.returnValue(Promise.reject(error));

      component.expense.name = 'Updated Coffee';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Update failed', '', jasmine.objectContaining({ duration: 3000 }));
    }));
  });

  describe('RT-94-UT-005: Reset functionality', () => {
    it('should reset expense to original values', () => {
      component.expense.name = 'Modified Coffee';
      component.expense.amount = 10;

      component.reset();

      expect(component.expense.name).toBe('Coffee');
      expect(component.expense.amount).toBe(5.5);
    });
  });

  describe('RT-94-UT-006: isExpenseUntouched detection', () => {
    it('should return true when expense is unchanged', () => {
      const result = component.isExpenseUntouched();
      expect(result).toBe(true);
    });

    it('should return false when expense is modified', () => {
      component.expense.name = 'Modified';
      const result = component.isExpenseUntouched();
      expect(result).toBe(false);
    });

    it('should return false when amount is modified', () => {
      component.expense.amount = 10;
      const result = component.isExpenseUntouched();
      expect(result).toBe(false);
    });
  });

  describe('RT-94-UT-007: Format amount functionality', () => {
    it('should format decimal amount to 2 decimal places', () => {
      component.expense.amount = 5.555;
      component.formatAmount();
      expect(component.expense.amount).toBe(5.56);
    });

    it('should not modify string amounts', () => {
      component.expense.amount = '5.50';
      component.formatAmount();
      expect(component.expense.amount).toBe('5.50');
    });

    it('should handle null amount gracefully', () => {
      component.expense.amount = null as any;
      component.formatAmount();
      expect(component.expense.amount).toBeNull();
    });
  });

  describe('RT-94-UT-008: Preview data mode', () => {
    const previewData: ManageExpenseData = {
      expense: { ...mockExpense, category: 'NewCategory', type: 'NewType' },
      previewDataMode: true,
    };

    beforeEach(fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MatDialogModule,
          FormsModule,
          MatFormFieldModule,
          MatSelectModule,
          MatDatepickerModule,
          MatInputModule,
          MatButtonModule,
          MatSnackBarModule,
        ],
        declarations: [ManageExpenseComponent],
        providers: [
          provideNativeDateAdapter(),
          DatePipe,
          { provide: MAT_DIALOG_DATA, useValue: previewData },
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: DatabaseService, useValue: jasmine.createSpyObj('DatabaseService', ['updateExpense', 'deleteExpense']) },
          { provide: ExpenseDataService, useValue: jasmine.createSpyObj('ExpenseDataService', [], {
            categoriesSignal: jasmine.createSpy().and.returnValue(['Food', 'Transport']),
            expenseSourcesSignal: jasmine.createSpy().and.returnValue(['Cash', 'Card']),
          })},
          { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['getUserId'], { userId$: of('user-123') }) },
          { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ManageExpenseComponent);
      component = fixture.componentInstance;
      mockDatabaseService = TestBed.inject(DatabaseService);
      mockDialogRef = TestBed.inject(MatDialogRef);
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should set update to true in preview mode', () => {
      expect(component.update).toBe(true);
    });

    it('should close dialog with expense data on update in preview mode', fakeAsync(() => {
      component.expense.name = 'Preview Updated';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Preview Updated' }));
    }));
  });
});
