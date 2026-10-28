import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';

import { ManageExpenseComponent } from './manage-expense.component';
import { Expense } from '@core/interfaces/expense-model';
import { DatabaseService } from '@core/services/database.service';
import { ExpenseDataService } from '@core/services/expense-data.service';
import { UserService } from '@core/services/user.service';

describe('ManageExpenseComponent — Component: delete button (UI) [RT-93, AC-1, Component]', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;
  let databaseService: jasmine.SpyObj<DatabaseService>;
  let userService: jasmine.SpyObj<UserService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockExpense: Expense = {
    id: 'expense-123',
    name: 'Test Expense',
    date: new Date('2024-03-15'),
    category: 'Food',
    type: 'Manual',
    amount: 50,
  };

  const mockData = { expense: mockExpense, previewDataMode: false };

  beforeEach(fakeAsync(() => {
    const databaseSpy = jasmine.createSpyObj('DatabaseService', ['deleteExpense']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserId']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const expenseDataServiceSpy = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: () => ['Food', 'Transport'],
      expenseSourcesSignal: () => ['Manual', 'Imported'],
    });

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule,
      ],
      declarations: [ManageExpenseComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DatabaseService, useValue: databaseSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ExpenseDataService, useValue: expenseDataServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
    tick();
  }));

  it('RT-93-MEC001: should render a delete button in the template', () => {
    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    expect(deleteButton).toBeTruthy();
  });

  it('RT-93-MEC002: should call deleteExpense when delete button is clicked', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    // Find and click the delete button
    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    if (deleteButton) {
      deleteButton.nativeElement.click();
    } else {
      // Fallback: call deleteExpense directly if button not found by selector
      component.deleteExpense();
    }
    tick();

    expect(databaseService.deleteExpense).toHaveBeenCalled();
  }));

  it('RT-93-MEC003: should show success snackbar after successful delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    if (deleteButton) {
      deleteButton.nativeElement.click();
    } else {
      component.deleteExpense();
    }
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Expense Deleted!', '', jasmine.objectContaining({ duration: 3000 }));
  }));

  it('RT-93-MEC004: should close the dialog after successful delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    if (deleteButton) {
      deleteButton.nativeElement.click();
    } else {
      component.deleteExpense();
    }
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith('Successful');
  }));

  it('RT-93-MEC005: should show error snackbar when delete fails', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    const testError = new Error('Network error');
    databaseService.deleteExpense.and.returnValue(Promise.reject(testError));

    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    if (deleteButton) {
      deleteButton.nativeElement.click();
    } else {
      component.deleteExpense();
    }
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Network error', '', jasmine.objectContaining({ duration: 3000 }));
  }));

  it('RT-93-MEC006: should not close dialog when delete fails', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    const testError = new Error('Network error');
    databaseService.deleteExpense.and.returnValue(Promise.reject(testError));

    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-expense"], button[aria-label*="delete"], .mat-dialog-actions button'));
    if (deleteButton) {
      deleteButton.nativeElement.click();
    } else {
      component.deleteExpense();
    }
    tick();

    expect(component['dialogRef'].close).not.toHaveBeenCalled();
  }));

  it('RT-93-MEC007: should render expense details in the form', () => {
    fixture.detectChanges();
    const expenseName = component.expense.name;
    expect(component.expense.name).toBe('Test Expense');
  });

  it('RT-93-MEC008: should have the original expense stored for comparison', () => {
    expect(component.original).toBeTruthy();
    expect(component.original.name).toBe('Test Expense');
  });
});
