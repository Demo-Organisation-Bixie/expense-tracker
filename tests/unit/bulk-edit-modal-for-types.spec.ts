import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { BulkEditModalComponent } from '../../../../src/app/shared/components/bulk-edit-modal/bulk-edit-modal.component';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { DatabaseService } from '../../../../src/app/core/services/database.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { BulkEditDialogData } from '../../../../src/app/dashboard/interfaces/bulk-edit-dialog-data';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('BulkEditModalForTypes - Type Grouping in Expense List/Table', () => {
  let component: BulkEditModalComponent;
  let fixture: ComponentFixture<BulkEditModalComponent>;
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BulkEditModalComponent>>;

  const mockData: BulkEditDialogData = {
    expenses: [
      { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 100, id: '1' },
      { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 50, id: '2' },
      { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 75, id: '3' },
    ],
    editType: 'type',
  };

  beforeEach(fakeAsync(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: jasmine.createSpy().and.returnValue(['Groceries', 'Food', 'Transport']),
      expenseTypesSignal: jasmine.createSpy().and.returnValue(['Credit', 'Debit', 'Cash']),
    });

    mockDatabaseService = jasmine.createSpyObj('DatabaseService', ['batchUpdateExpenses'], {
      announceExpenseCreated: jasmine.createSpy(),
      announceCategoriesAdded: jasmine.createSpy(),
    });

    mockUserService = jasmine.createSpyObj('UserService', ['getUserId'], {
      getUser: jasmine.createSpy().and.returnValue({ uid: 'test-user-1' }),
    });
    mockUserService.getUserId.and.returnValue('test-user-1');

    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatTableModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BulkEditModalComponent,
      ],
      providers: [
        DatePipe,
        CurrencyPipe,
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('RT-97-UT-024: Type column in expense table', () => {
    it('should display type column when editing by type', () => {
      expect(component.displayedColumns).toContain('type');
      expect(component.displayedColumns).toContain('name');
      expect(component.displayedColumns).toContain('amount');
      expect(component.displayedColumns).toContain('date');
    });

    it('should not include category column when editing by type', () => {
      expect(component.displayedColumns).not.toContain('category');
    });
  });

  describe('RT-97-UT-025: Bulk edit by type', () => {
    it('should initialize edit form with type field', () => {
      expect(component.editForm).toBeDefined();
      expect(component.editForm.get('type')).toBeTruthy();
    });

    it('should have payment types populated', () => {
      expect(component.paymentTypes).toBeDefined();
      expect(Array.isArray(component.paymentTypes)).toBe(true);
      expect(component.paymentTypes.length).toBeGreaterThan(0);
    });

    it('should contain default expense types', () => {
      expect(component.paymentTypes).toContain('Credit');
      expect(component.paymentTypes).toContain('Debit');
      expect(component.paymentTypes).toContain('Cash');
    });
  });

  describe('RT-97-UT-026: Bulk update expense types', () => {
    it('should update type for selected expenses', fakeAsync(() => {
      component.editForm.get('type')?.setValue('Cash');
      mockDatabaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

      component.bulkUpdate();
      tick();

      expect(mockDatabaseService.batchUpdateExpenses).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    }));

    it('should preview type update without saving', () => {
      component.editForm.get('type')?.setValue('Cash');

      component.bulkUpdate();

      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ editForm: jasmine.objectContaining({ type: 'Cash' }) }));
    });
  });

  describe('RT-97-UT-027: Category column when editing by category', () => {
    it('should display category column when editing by category', () => {
      const categoryData: BulkEditDialogData = {
        expenses: [
          { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 100, id: '1' },
        ],
        editType: 'category',
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MatDialogModule,
          MatTableModule,
          MatSelectModule,
          MatFormFieldModule,
          MatButtonModule,
          FormsModule,
          ReactiveFormsModule,
          BulkEditModalComponent,
        ],
        providers: [
          DatePipe,
          CurrencyPipe,
          { provide: ExpenseDataService, useValue: mockExpenseDataService },
          { provide: DatabaseService, useValue: mockDatabaseService },
          { provide: UserService, useValue: mockUserService },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: categoryData },
        ],
      }).compileComponents();

      const categoryFixture = TestBed.createComponent(BulkEditModalComponent);
      const categoryComponent = categoryFixture.componentInstance;
      categoryFixture.detectChanges();

      expect(categoryComponent.displayedColumns).toContain('category');
      expect(categoryComponent.displayedColumns).not.toContain('type');
    });
  });

  describe('RT-97-UT-028: Bulk delete with type grouping', () => {
    it('should preview selected expenses for deletion', () => {
      component.bulkDelete();

      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ expenses: mockData.expenses }));
    });

    it('should delete selected expenses', fakeAsync(() => {
      mockDatabaseService.batchUpdateExpenses.and.returnValue(Promise.resolve());

      component.bulkDelete();
      tick();

      expect(mockDatabaseService.batchUpdateExpenses).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ successful: 3 }));
    }));
  });

  describe('RT-97-UT-029: Cancel bulk edit', () => {
    it('should close dialog without changes', () => {
      component.onCancelClick();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
