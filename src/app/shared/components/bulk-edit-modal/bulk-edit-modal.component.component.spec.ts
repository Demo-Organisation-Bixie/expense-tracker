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

describe('BulkEditModalComponent — Component: delete confirmation (UI) [RT-93, AC-1, Component]', () => {
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

  it('RT-93-BEM-C001: should render the delete confirmation dialog with title', () => {
    expect(component.data.title).toBe('Delete Expenses');
  });

  it('RT-93-BEM-C002: should display the list of expenses to be deleted', () => {
    expect(component.selectedExpenses).toBeTruthy();
    expect(component.selectedExpenses.data.length).toBe(2);
  });

  it('RT-93-BEM-C003: should have a confirm button that triggers bulkDelete', () => {
    const confirmButton = fixture.debugElement.query(By.css('button[mat-flat-button]'));
    expect(confirmButton).toBeTruthy();
  });

  it('RT-93-BEM-C004: should have a cancel button that closes dialog without action', fakeAsync(() => {
    component.onCancelClick();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalled();
    expect(databaseService.batchUpdateExpenses).not.toHaveBeenCalled();
  }));

  it('RT-93-BEM-C005: should call batchUpdateExpenses when confirm button is clicked', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(databaseService.batchUpdateExpenses).toHaveBeenCalled();
  }));

  it('RT-93-BEM-C006: should close dialog with successful result after delete', fakeAsync(() => {
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 2 });
  }));

  it('RT-93-BEM-C007: should show expense names in the preview table', () => {
    const expenseNames = component.selectedExpenses.data.map(e => e.name);
    expect(expenseNames).toContain('Expense 1');
    expect(expenseNames).toContain('Expense 2');
  });

  it('RT-93-BEM-C008: should display correct number of rows in preview table', () => {
    expect(component.selectedExpenses.data.length).toBe(2);
  });

  it('RT-93-BEM-C009: should handle delete confirmation with single expense', fakeAsync(() => {
    component.data.expenses = [mockExpenses[0]];
    component.ngOnInit();
    userService.getUserId.and.returnValue('user-456');
    databaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

    component.bulkDelete();
    tick();

    expect(component['dialogRef'].close).toHaveBeenCalledWith({ successful: 1 });
  }));

  it('RT-93-BEM-C010: should not call database when previewOnly is true', fakeAsync(() => {
    component.data.previewOnly = true;
    component.ngOnInit();

    component.bulkDelete();
    tick();

    expect(databaseService.batchUpdateExpenses).not.toHaveBeenCalled();
    expect(component['dialogRef'].close).toHaveBeenCalledWith({ expenses: mockExpenses });
  }));
});
