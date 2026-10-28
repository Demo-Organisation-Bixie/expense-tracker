import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { BulkEditModalComponent } from './bulk-edit-modal.component';
import { Expense } from '@core/interfaces/expense-model';
import { DatabaseService } from '@core/services/database.service';
import { ExpenseDataService } from '@core/services/expense-data.service';
import { UserService } from '@core/services/user.service';
import { BulkEditDialogData } from '../../../dashboard/interfaces/bulk-edit-dialog-data';

describe('BulkEditModalComponent — Unit: bulkDelete() [RT-93, AC-1, Unit]', () => {
  let component: BulkEditModalComponent;
  let fixture: ComponentFixture<BulkEditModalComponent>;
  let databaseService: jasmine.SpyObj<DatabaseService>;
  let userService: jasmine.SpyObj<UserService>;
  let expenseDataService: jasmine.SpyObj<ExpenseDataService>;

  const mockExpenses: Expense[] = [
    { id: 'exp-1', name: 'Expense 1', date: new Date('2024-03-15'), category: 'Food', type: 'Manual', amount: 50 },
    { id: 'exp-2', name: 'Expense 2', date: new Date('2024-03-16'), category: 'Transport', type: 'Imported', amount: 30 },
  ];

  const mockData: BulkEditDialogData = {
    title: 'Delete Expenses',
    expenses: mockExpenses,
    confirmButtonText: 'Delete Expenses',
    cancelButtonText: 'Cancel',
    editType: 'delete',
    previewOnly: false,
  };

  beforeEach(async () => {
    const databaseSpy = jasmine.createSpyObj('DatabaseService', ['batchUpdateExpenses']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserId']);
    const expenseDataServiceSpy = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: () => ['Food', 'Transport'],
      expenseSourcesSignal: () => ['Manual', 'Imported'],
    });

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTableModule,
        MatButtonModule,
        FormsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DatabaseService, useValue: databaseSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ExpenseDataService, useValue: expenseDataServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkEditModalComponent);
    component = fixture.componentInstance;
    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    expenseDataService = TestBed.inject(ExpenseDataService) as jasmine.SpyObj<ExpenseDataService>;
    fixture.detectChanges();
    tick();
  });

  it('RT-93-BEM001: should close dialog with expenses array when previewOnly is true', fakeAsync(() => {
    component.data.previewOnly = true;
    component.ngOnInit();

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ expenses: mockExpenses });
  }));

  it('RT-93-BEM002: should call batchUpdateExpenses with correct null values when previewOnly is false', fakeAsync(() => {
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    const expectedUpdates: Record<string, null> = {
      'users/user-456/expenses/exp-1': null,
      'users/user-456/expenses/exp-2': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);
  }));

  it('RT-93-BEM003: should close dialog with successful count on successful bulk delete', fakeAsync(() => {
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 2 });
  }));

  it('RT-93-BEM004: should close dialog with error on failed bulk delete', fakeAsync(() => {
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    const testError = new Error('Firebase update failed');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.reject(testError));

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ error: testError });
  }));

  it('RT-93-BEM005: should construct correct Firebase path for each expense', fakeAsync(() => {
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-789');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    const expectedUpdates: Record<string, null> = {
      'users/user-789/expenses/exp-1': null,
      'users/user-789/expenses/exp-2': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);
  }));

  it('RT-93-BEM006: should handle single expense deletion', fakeAsync(() => {
    component.data.expenses = [mockExpenses[0]];
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    const expectedUpdates: Record<string, null> = {
      'users/user-456/expenses/exp-1': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);
    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 1 });
  }));

  it('RT-93-BEM007: should handle empty expenses array', fakeAsync(() => {
    component.data.expenses = [];
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith({});
    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 0 });
  }));

  it('RT-93-BEM008: should not call batchUpdateExpenses when previewOnly is true', fakeAsync(() => {
    component.data.previewOnly = true;
    component.ngOnInit();

    component.bulkDelete();
    tick();

    expect(databaseService.batchUpdateExpenses).not.toHaveBeenCalled();
  }));

  it('RT-93-BEM009: should use userId from UserService', fakeAsync(() => {
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('custom-user-id');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    const expectedUpdates: Record<string, null> = {
      'users/custom-user-id/expenses/exp-1': null,
      'users/custom-user-id/expenses/exp-2': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);
  }));

  it('RT-93-BEM010: should close dialog with correct successful count for multiple expenses', fakeAsync(() => {
    component.data.expenses = [
      { id: 'exp-1', name: 'E1', date: new Date(), category: 'Food', type: 'Manual', amount: 10 },
      { id: 'exp-2', name: 'E2', date: new Date(), category: 'Food', type: 'Manual', amount: 20 },
      { id: 'exp-3', name: 'E3', date: new Date(), category: 'Food', type: 'Manual', amount: 30 },
    ];
    component.data.previewOnly = false;
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 3 });
  }));
});
