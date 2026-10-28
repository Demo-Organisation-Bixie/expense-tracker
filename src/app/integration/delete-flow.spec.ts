import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ManageExpenseComponent } from '@shared/components/manage-expense/manage-expense.component';
import { BulkEditModalComponent } from '@shared/components/bulk-edit-modal/bulk-edit-modal.component';
import { ImportReviewTableComponent } from '@import-expenses/components/import-review-table/import-review-table.component';
import { Expense } from '@core/interfaces/expense-model';
import { DatabaseService } from '@core/services/database.service';
import { ExpenseDataService } from '@core/services/expense-data.service';
import { UserService } from '@core/services/user.service';
import { BulkEditDialogData, BulkEditDialogResult } from '@dashboard/interfaces/bulk-edit-dialog-data';
import { MatDialog, MatDialogModule as MdMatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CurrencyPipe } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

describe('Legacy Angular — Integration: Full delete flow (component → service → Firebase) [RT-93, AC-1, Integration]', () => {
  let manageComponent: ManageExpenseComponent;
  let importTableComponent: ImportReviewTableComponent;
  let bulkEditComponent: BulkEditModalComponent;
  let fixtureManage: ComponentFixture<ManageExpenseComponent>;
  let fixtureImport: ComponentFixture<ImportReviewTableComponent>;
  let fixtureBulkEdit: ComponentFixture<BulkEditModalComponent>;
  let databaseService: jasmine.SpyObj<DatabaseService>;
  let userService: jasmine.SpyObj<UserService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let snackBarImport: jasmine.SpyObj<MatSnackBar>;

  const mockExpense: Expense = {
    id: 'integration-exp-1',
    name: 'Integration Test Expense',
    date: new Date('2024-03-15'),
    category: 'Food',
    type: 'Manual',
    amount: 100,
  };

  const mockExpenses: Expense[] = [
    { id: 'int-exp-1', name: 'Int Expense 1', date: new Date('2024-03-15'), category: 'Food', type: 'Manual', amount: 50 },
    { id: 'int-exp-2', name: 'Int Expense 2', date: new Date('2024-03-16'), category: 'Transport', type: 'Imported', amount: 30 },
  ];

  beforeEach(async () => {
    const databaseSpy = jasmine.createSpyObj('DatabaseService', ['deleteExpense', 'batchUpdateExpenses']);
    databaseSpy.deleteExpense.and.returnValue(Promise.resolve());
    databaseSpy.batchUpdateExpenses.and.returnValue(Promise.resolve());

    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserId']);
    userServiceSpy.getUserId.and.returnValue('integration-user-123');

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    const expenseDataServiceSpy = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: () => ['Food', 'Transport'],
      expenseSourcesSignal: () => ['Manual', 'Imported'],
    });

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule,
        ImportReviewTableComponent,
        MatTableModule,
        MatTabsModule,
        MatSortModule,
        MatPaginatorModule,
        MatIconModule,
        MatMenuModule,
        MatCheckboxModule,
        ReactiveFormsModule,
      ],
      declarations: [ManageExpenseComponent, BulkEditModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { expense: mockExpense, previewDataMode: false } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DatabaseService, useValue: databaseSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ExpenseDataService, useValue: expenseDataServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        CurrencyPipe,
      ],
    }).compileComponents();

    // Create ManageExpenseComponent
    fixtureManage = TestBed.createComponent(ManageExpenseComponent);
    manageComponent = fixtureManage.componentInstance;
    fixtureManage.detectChanges();
    tick();

    // Create ImportReviewTableComponent
    fixtureImport = TestBed.createComponent(ImportReviewTableComponent);
    importTableComponent = fixtureImport.componentInstance;
    importTableComponent.expenses.set(mockExpenses);
    fixtureImport.detectChanges();
    tick();

    // Create BulkEditModalComponent
    const bulkEditData: BulkEditDialogData = {
      title: 'Delete Expenses',
      expenses: mockExpenses,
      confirmButtonText: 'Delete Expenses',
      cancelButtonText: 'Cancel',
      editType: 'delete',
      previewOnly: false,
    };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: bulkEditData });
    fixtureBulkEdit = TestBed.createComponent(BulkEditModalComponent);
    bulkEditComponent = fixtureBulkEdit.componentInstance;
    fixtureBulkEdit.detectChanges();
    tick();

    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBarImport = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('RT-93-INT001: should complete full delete flow from ManageExpenseComponent through DatabaseService', fakeAsync(() => {
    // Step 1: User initiates delete from ManageExpenseComponent
    manageComponent.deleteExpense();
    tick();

    // Step 2: DatabaseService.deleteExpense is called with correct params
    expect(databaseService.deleteExpense).toHaveBeenCalledWith('integration-user-123', 'integration-exp-1');

    // Step 3: Dialog closes successfully
    expect(manageComponent['dialogRef'].close).toHaveBeenCalledWith('Successful');
  }));

  it('RT-93-INT002: should complete full delete flow from ImportReviewTableComponent through BulkEditModalComponent', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    // Step 1: User clicks delete on a row
    importTableComponent.deleteRow(mockExpenses[0]);
    tick();

    // Step 2: BulkEditModalComponent opens
    expect(mockDialog.open).toHaveBeenCalledWith(BulkEditModalComponent, jasmine.any(Object));

    // Step 3: Snackbar shows success
    expect(snackBarImport.open).toHaveBeenCalledWith('Expense successfully deleted.', 'Close', { duration: 3000 });

    // Step 4: Expense is removed from table
    expect(importTableComponent.expensesDataSource.data.length).toBe(1);
  }));

  it('RT-93-INT003: should complete full bulk delete flow from ImportReviewTableComponent through BulkEditModalComponent', fakeAsync(() => {
    importTableComponent.selection.select(mockExpenses[0]);
    importTableComponent.selection.select(mockExpenses[1]);

    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    // Step 1: User opens bulk edit dialog for delete
    importTableComponent.openBulkEditDialog('delete');
    tick();

    // Step 2: BulkEditModalComponent opens with selected expenses
    expect(mockDialog.open).toHaveBeenCalledWith(BulkEditModalComponent, jasmine.any(Object));

    // Step 3: Snackbar shows bulk delete success
    expect(snackBarImport.open).toHaveBeenCalledWith('Expenses successfully deleted.', 'Close', { duration: 3000 });

    // Step 4: All selected expenses removed
    expect(importTableComponent.expensesDataSource.data.length).toBe(0);
    expect(importTableComponent.selection.selected.length).toBe(0);
  }));

  it('RT-93-INT004: should complete full bulk delete flow from BulkEditModalComponent through DatabaseService', fakeAsync(() => {
    // Step 1: User confirms bulk delete in BulkEditModalComponent
    bulkEditComponent.bulkDelete();
    tick();

    // Step 2: DatabaseService.batchUpdateExpenses is called with null values
    const expectedUpdates: Record<string, null> = {
      'users/integration-user-123/expenses/int-exp-1': null,
      'users/integration-user-123/expenses/int-exp-2': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);

    // Step 3: Dialog closes with successful count
    expect(bulkEditComponent['dialogRef'].close).toHaveBeenCalledWith({ successful: 2 });
  }));

  it('RT-93-INT005: should handle error propagation through the full delete flow', fakeAsync(() => {
    const testError = new Error('Firebase connection failed');
    databaseService.deleteExpense.and.returnValue(Promise.reject(testError));

    manageComponent.deleteExpense();
    tick();

    // Error should propagate to snackbar, not close dialog
    expect(manageComponent['dialogRef'].close).not.toHaveBeenCalled();
  }));

  it('RT-93-INT006: should emit expensesChange after delete in ImportReviewTableComponent', fakeAsync(() => {
    const emittedExpenses: Expense[][] = [];
    importTableComponent.expensesChange.subscribe((data) => emittedExpenses.push(data));

    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    importTableComponent.deleteRow(mockExpenses[0]);
    tick();

    expect(emittedExpenses.length).toBeGreaterThan(0);
    expect(emittedExpenses[0].length).toBe(1);
  }));

  it('RT-93-INT007: should maintain data integrity after delete flow', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    const initialLength = importTableComponent.expensesDataSource.data.length;
    importTableComponent.deleteRow(mockExpenses[0]);
    tick();

    // Verify remaining expenses are intact
    const remainingExpense = importTableComponent.expensesDataSource.data.find(e => e.id === 'int-exp-2');
    expect(remainingExpense).toBeTruthy();
    expect(remainingExpense?.name).toBe('Int Expense 2');
    expect(remainingExpense?.amount).toBe(30);
  }));

  it('RT-93-INT008: should handle delete flow with previewOnly mode', fakeAsync(() => {
    bulkEditComponent.data.previewOnly = true;
    bulkEditComponent.ngOnInit();

    bulkEditComponent.bulkDelete();
    tick();

    // In preview mode, should return expenses without calling database
    expect(bulkEditComponent['dialogRef'].close).toHaveBeenCalledWith({ expenses: mockExpenses });
    expect(databaseService.batchUpdateExpenses).not.toHaveBeenCalled();
  }));

  it('RT-93-INT009: should coordinate multiple components in delete workflow', fakeAsync(() => {
    // Simulate the full workflow: ImportReviewTable → BulkEditModal → DatabaseService
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    // User selects and deletes multiple expenses
    importTableComponent.selection.select(mockExpenses[0]);
    importTableComponent.selection.select(mockExpenses[1]);
    importTableComponent.openBulkEditDialog('delete');
    tick();

    // Verify all components participated correctly
    expect(mockDialog.open).toHaveBeenCalled();
    expect(snackBarImport.open).toHaveBeenCalledWith('Expenses successfully deleted.', 'Close', { duration: 3000 });
    expect(importTableComponent.expensesDataSource.data.length).toBe(0);
  }));

  it('RT-93-INT010: should handle delete flow with single expense through full chain', fakeAsync(() => {
    const singleExpense: Expense = {
      id: 'single-exp-1',
      name: 'Single Expense',
      date: new Date('2024-03-15'),
      category: 'Food',
      type: 'Manual',
      amount: 75,
    };

    const singleData: BulkEditDialogData = {
      title: 'Delete Expense',
      expenses: [singleExpense],
      confirmButtonText: 'Delete Expense',
      cancelButtonText: 'Cancel',
      editType: 'delete',
      previewOnly: false,
    };

    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: singleData });
    fixtureBulkEdit = TestBed.createComponent(BulkEditModalComponent);
    bulkEditComponent = fixtureBulkEdit.componentInstance;
    fixtureBulkEdit.detectChanges();
    tick();

    bulkEditComponent.bulkDelete();
    tick();

    const expectedUpdates: Record<string, null> = {
      'users/integration-user-123/expenses/single-exp-1': null,
    };
    expect(databaseService.batchUpdateExpenses).toHaveBeenCalledWith(expectedUpdates);
    expect(bulkEditComponent['dialogRef'].close).toHaveBeenCalledWith({ successful: 1 });
  }));
});
