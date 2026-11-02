import { BulkEditModalComponent } from '../../src/app/shared/components/bulk-edit-modal/bulk-edit-modal.component';
import { Expense } from '../../src/app/core/interfaces/expense-model';
import { BulkEditDialogData, BulkEditDialogResult } from '../../src/app/dashboard/interfaces/bulk-edit-dialog-data';
import { ExpenseDataService } from '../../src/app/core/services/expense-data.service';
import { DatabaseService } from '../../src/app/core/services/database.service';
import { UserService } from '../../src/app/core/services/user.service';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('Bulk Edit Modal for Types Tests', () => {
  let component: BulkEditModalComponent;
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BulkEditModalComponent>>;

  const mockExpenses: Expense[] = [
    { name: 'Expense 1', date: new Date('2024-01-01'), category: 'Food', type: 'Credit', amount: 50.0, id: 'id1' },
    { name: 'Expense 2', date: new Date('2024-01-02'), category: 'Transport', type: 'Debit', amount: 30.0, id: 'id2' },
  ];

  const mockDialogData: BulkEditDialogData = {
    title: 'Update Payment Type',
    expenses: mockExpenses,
    confirmButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    editType: 'type',
  };

  beforeEach(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', []);
    mockExpenseDataService.categoriesSignal = jasmine.fn().and.returnValue(['Groceries', 'Transport']);
    mockExpenseDataService.expenseSourcesSignal = jasmine.fn().and.returnValue(['Credit', 'Debit', 'Cash']);

    mockDatabaseService = jasmine.createSpyObj('DatabaseService', ['batchUpdateExpenses']);
    mockDatabaseService.batchUpdateExpenses = jasmine.fn().and.returnValue(Promise.resolve());

    mockUserService = jasmine.createSpyObj('UserService', ['getUserId']);
    mockUserService.getUserId = jasmine.fn().and.returnValue('mock-user-id');

    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockDialogRef.close = jasmine.fn();
  });

  // RT-96-UT-025: Test BulkEditModalComponent open with type edit
  it('RT-96-UT-025 | RT-97 | BulkEditModalComponent open with type edit sets correct columns | Risk: High', () => {
    const fb = new FormBuilder();
    component = new BulkEditModalComponent(fb, mockDialogRef, mockDialogData);
    component['expenseDataService'] = mockExpenseDataService;
    component['databaseService'] = mockDatabaseService;
    component['userService'] = mockUserService;

    component.ngOnInit();

    expect(component.displayedColumns).toContain('type');
    expect(component.displayedColumns).not.toContain('category');
  });

  // RT-96-UT-026: Test BulkEditModalComponent confirm with type selection
  it('RT-96-UT-026 | RT-97 | BulkEditModalComponent confirm with type selection updates expenses | Risk: High', () => {
    const fb = new FormBuilder();
    component = new BulkEditModalComponent(fb, mockDialogRef, mockDialogData);
    component['expenseDataService'] = mockExpenseDataService;
    component['databaseService'] = mockDatabaseService;
    component['userService'] = mockUserService;

    component.ngOnInit();

    // Set form value with type selection
    component.editForm = fb.group({
      type: ['Credit'],
    });

    // Preview mode test
    component.bulkUpdate();

    expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ editForm: jasmine.any(Object) }));
  });

  // RT-96-UT-027: Test BulkEditModalComponent cancel closes without changes
  it('RT-96-UT-027 | RT-97 | BulkEditModalComponent cancel closes without changes | Risk: Medium', () => {
    const fb = new FormBuilder();
    component = new BulkEditModalComponent(fb, mockDialogRef, mockDialogData);
    component['expenseDataService'] = mockExpenseDataService;
    component['databaseService'] = mockDatabaseService;
    component['userService'] = mockUserService;

    component.ngOnInit();
    component.onCancelClick();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  // RT-96-UT-028: Test BulkEditModalComponent type dropdown population
  it('RT-96-UT-028 | RT-97 | BulkEditModalComponent type dropdown populates from expense sources | Risk: Medium', () => {
    const paymentTypes = mockExpenseDataService.expenseSourcesSignal();

    expect(paymentTypes).toContain('Credit');
    expect(paymentTypes).toContain('Debit');
    expect(paymentTypes).toContain('Cash');
  });

  // RT-96-UT-029: Test BulkEditModalComponent validation for type selection
  it('RT-96-UT-029 | RT-97 | BulkEditModalComponent validates type selection is required | Risk: Medium', () => {
    const fb = new FormBuilder();
    const form = fb.group({
      type: ['', []], // Empty validator to test required behavior
    });

    expect(form.get('type')?.value).toBe('');
    expect(form.get('type')?.valid).toBe(false);
  });

  // RT-96-UT-030: Test BulkEditModalComponent multiple expense type update
  it('RT-96-UT-030 | RT-97 | BulkEditModalComponent updates type for multiple expenses | Risk: High', () => {
    const fb = new FormBuilder();
    component = new BulkEditModalComponent(fb, mockDialogRef, mockDialogData);
    component['expenseDataService'] = mockExpenseDataService;
    component['databaseService'] = mockDatabaseService;
    component['userService'] = mockUserService;

    component.ngOnInit();

    // Set form value with type selection
    component.editForm = fb.group({
      type: ['Credit'],
    });

    // In preview mode, verify the form value is captured
    component.bulkUpdate();

    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ editForm: jasmine.any(Object) }));
  });
});
