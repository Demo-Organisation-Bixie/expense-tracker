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

describe('RT-94 | ManageExpenseComponent | Integration | Tier: High', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;
  let mockDatabaseService: any;
  let mockExpenseDataService: any;
  let mockUserService: any;
  let mockSnackBar: any;
  let mockDialogRef: any;

  const mockExpense: Expense = {
    id: 'expense-int-1',
    name: 'Lunch',
    amount: 15.75,
    date: new Date('2024-04-10'),
    category: 'Food',
    type: 'Card',
    comments: 'Team lunch',
  };

  const mockDialogData: ManageExpenseData = {
    expense: mockExpense,
    update: true,
    previewDataMode: false,
  };

  beforeEach(fakeAsync(() => {
    const databaseSpy = jasmine.createSpyObj('DatabaseService', ['updateExpense', 'deleteExpense']);
    const expenseDataServiceSpy = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: jasmine.createSpy().and.returnValue(['Food', 'Transport', 'Shopping', 'Entertainment']),
      expenseSourcesSignal: jasmine.createSpy().and.returnValue(['Cash', 'Card', 'UPI', 'Digital Wallet']),
    });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserId'], { userId$: of('user-integration') });
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

    mockUserService.getUserId.and.returnValue('user-integration');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  describe('RT-94-IN-001: Full update flow - valid data', () => {
    it('should complete full update flow: modify fields -> validate -> submit -> success', fakeAsync(() => {
      // Step 1: Verify initial state - expense is pre-populated
      expect(component.expense.name).toBe('Lunch');
      expect(component.expense.amount).toBe(15.75);
      expect(component.expense.category).toBe('Food');
      expect(component.expense.type).toBe('Card');
      expect(component.expense.comments).toBe('Team lunch');
      expect(component.isExpenseUntouched()).toBe(true);

      // Step 2: Modify expense fields
      component.expense.name = 'Dinner';
      component.expense.amount = 25.5;
      component.expense.category = 'Entertainment';
      component.expense.type = 'Cash';
      component.expense.comments = 'Client dinner';

      // Step 3: Verify changes detected
      expect(component.isExpenseUntouched()).toBe(false);

      // Step 4: Submit update
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      component.updateExpense(true);

      // Step 5: Verify database call with modified data
      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).toHaveBeenCalledWith(
        'user-integration',
        'expense-int-1',
        jasmine.objectContaining({
          name: 'Dinner',
          amount: 25.5,
          category: 'Entertainment',
          type: 'Cash',
          comments: 'Client dinner',
        }),
      );

      // Step 6: Verify success state
      expect(mockDialogRef.close).toHaveBeenCalledWith('Successful');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Expense Updated!', '', jasmine.objectContaining({ duration: 3000 }));
    }));
  });

  describe('RT-94-IN-002: Full update flow - validation prevents submission', () => {
    it('should not submit when name is too short', fakeAsync(() => {
      component.expense.name = 'Ab'; // Less than 4 characters
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    }));

    it('should not submit when amount is zero', fakeAsync(() => {
      component.expense.amount = 0;
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    }));

    it('should not submit when amount is negative', fakeAsync(() => {
      component.expense.amount = -5;
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    }));

    it('should not submit when category is empty', fakeAsync(() => {
      component.expense.category = '';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    }));

    it('should not submit when type is empty', fakeAsync(() => {
      component.expense.type = '';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).not.toHaveBeenCalled();
    }));
  });

  describe('RT-94-IN-003: Update flow with database failure', () => {
    it('should show error snackbar when database update fails', fakeAsync(() => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.updateExpense.and.returnValue(Promise.reject(dbError));

      component.expense.name = 'Updated Lunch';
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Database connection failed', '', jasmine.objectContaining({ duration: 3000 }));
      expect(mockDialogRef.close).not.toHaveBeenCalledWith('Successful');
    }));
  });

  describe('RT-94-IN-004: Reset functionality in update flow', () => {
    it('should reset all fields to original values', () => {
      // Modify all fields
      component.expense.name = 'Modified';
      component.expense.amount = 100;
      component.expense.category = 'Shopping';
      component.expense.type = 'Digital Wallet';
      component.expense.comments = 'Modified comment';

      // Verify changes
      expect(component.isExpenseUntouched()).toBe(false);

      // Reset
      component.reset();

      // Verify all fields are back to original
      expect(component.expense.name).toBe('Lunch');
      expect(component.expense.amount).toBe(15.75);
      expect(component.expense.category).toBe('Food');
      expect(component.expense.type).toBe('Card');
      expect(component.expense.comments).toBe('Team lunch');
      expect(component.isExpenseUntouched()).toBe(true);
    });
  });

  describe('RT-94-IN-005: Amount formatting during update', () => {
    it('should format amount with many decimal places', fakeAsync(() => {
      component.expense.amount = 15.755;
      component.formatAmount();
      expect(component.expense.amount).toBe(15.76);
    }));

    it('should handle whole number amounts', fakeAsync(() => {
      component.expense.amount = 20;
      component.formatAmount();
      expect(component.expense.amount).toBe(20);
    }));

    it('should not format string amounts', fakeAsync(() => {
      component.expense.amount = '15.75';
      component.formatAmount();
      expect(component.expense.amount).toBe('15.75');
    }));
  });

  describe('RT-94-IN-006: Update with null/undefined edge cases', () => {
    it('should handle null comments gracefully', fakeAsync(() => {
      component.expense.comments = undefined as any;
      component.expense.name = 'Test';
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).toHaveBeenCalled();
    }));

    it('should handle missing comments field', fakeAsync(() => {
      delete (component.expense as any).comments;
      component.expense.name = 'Test';
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      component.updateExpense(true);

      tick();
      fixture.detectChanges();

      expect(mockDatabaseService.updateExpense).toHaveBeenCalled();
    }));
  });

  describe('RT-94-IN-007: Multiple sequential updates', () => {
    it('should allow multiple update attempts', fakeAsync(() => {
      // First update
      component.expense.name = 'First Update';
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      component.updateExpense(true);
      tick();
      fixture.detectChanges();
      expect(mockDatabaseService.updateExpense).toHaveBeenCalledTimes(1);

      // Second update
      component.expense.name = 'Second Update';
      mockDatabaseService.updateExpense.and.returnValue(Promise.resolve());
      component.updateExpense(true);
      tick();
      fixture.detectChanges();
      expect(mockDatabaseService.updateExpense).toHaveBeenCalledTimes(2);
    }));
  });
});
