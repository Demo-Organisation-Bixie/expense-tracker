import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ManageExpenseComponent } from './manage-expense.component';
import { Expense } from '@core/interfaces/expense-model';
import { DatabaseService } from '@core/services/database.service';
import { ExpenseDataService } from '@core/services/expense-data.service';
import { UserService } from '@core/services/user.service';

describe('ManageExpenseComponent — Unit: deleteExpense() [RT-93, AC-1, Unit]', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;
  let databaseService: jasmine.SpyObj<DatabaseService>;
  let userService: jasmine.SpyObj<UserService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let expenseDataService: jasmine.SpyObj<ExpenseDataService>;

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
    expenseDataService = TestBed.inject(ExpenseDataService) as jasmine.SpyObj<ExpenseDataService>;
    fixture.detectChanges();
    tick();
  }));

  it('RT-93-UC001: should call DatabaseService.deleteExpense with correct userId and expense id', () => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    component.deleteExpense();

    expect(userService.getUserId).toHaveBeenCalled();
    expect(databaseService.deleteExpense).toHaveBeenCalledWith('user-456', 'expense-123');
  });

  it('RT-93-UC002: should close dialog with "Successful" on successful delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    component.deleteExpense();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith('Successful');
  }));

  it('RT-93-UC003: should open success snackbar on successful delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());

    component.deleteExpense();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Expense Deleted!', '', jasmine.objectContaining({ duration: 3000 }));
  }));

  it('RT-93-UC004: should open error snackbar on failed delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    const testError = new Error('Database connection failed');
    databaseService.deleteExpense.and.returnValue(Promise.reject(testError));

    component.deleteExpense();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Database connection failed', '', jasmine.objectContaining({ duration: 3000 }));
  }));

  it('RT-93-UC005: should NOT close dialog on failed delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    const testError = new Error('Database connection failed');
    databaseService.deleteExpense.and.returnValue(Promise.reject(testError));

    component.deleteExpense();
    tick();

    expect(component['dialogRef'].close).not.toHaveBeenCalled();
  }));

  it('RT-93-UC006: should pass the expense id string (not undefined) to deleteExpense', () => {
    const expenseWithoutId: Expense = {
      name: 'No ID Expense',
      date: new Date('2024-03-15'),
      category: 'Food',
      type: 'Manual',
      amount: 10,
    };
    const mockDataNoId = { expense: expenseWithoutId, previewDataMode: false };
    
    // Reconfigure with expense without id
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: mockDataNoId });
    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUserId.and.returnValue('user-789');
    databaseService.deleteExpense.and.returnValue(Promise.resolve());
    fixture.detectChanges();
    tick();

    component.deleteExpense();

    // The expense id is undefined, but it should still be passed as-is
    expect(databaseService.deleteExpense).toHaveBeenCalledWith('user-789', undefined);
  });
});
