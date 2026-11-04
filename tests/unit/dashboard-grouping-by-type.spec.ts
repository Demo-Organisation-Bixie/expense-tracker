import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TableSummaryComponent } from '../../../../src/app/dashboard/components/table-summary/table-summary.component';
import { Expense } from '../../../../src/app/core/interfaces/expense-model';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DashboardGroupingByType - Type Grouping Display in Settings', () => {
  let component: TableSummaryComponent;
  let fixture: ComponentFixture<TableSummaryComponent>;
  let mockExpenseDataService: jasmine.SpyObj<ExpenseDataService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(fakeAsync(() => {
    mockExpenseDataService = jasmine.createSpyObj('ExpenseDataService', [], {
      categoriesSignal: jasmine.createSpy().and.returnValue(['Groceries', 'Transportation', 'Entertainment']),
      expenseTypesSignal: jasmine.createSpy().and.returnValue(['Credit', 'Debit', 'Cash']),
    });

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatChipsModule,
        MatMenuModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        TableSummaryComponent,
      ],
      providers: [
        DatePipe,
        CurrencyPipe,
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('RT-97-UT-012: Type grouping display in dashboard', () => {
    it('should have displayColumns including type', () => {
      expect(component.displayColumns).toContain('type');
    });

    it('should have type column in expense table', () => {
      const columns = component.displayColumns;
      expect(columns).toContain('name');
      expect(columns).toContain('amount');
      expect(columns).toContain('date');
      expect(columns).toContain('category');
      expect(columns).toContain('type');
    });
  });

  describe('RT-97-UT-013: Filter sources by type', () => {
    it('should compute filter sources from expense data', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 100 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 50 },
        { name: 'Expense 3', date: new Date(), category: 'Transport', type: 'Credit', amount: 75 },
      ];

      component.data.set(testExpenses);
      fixture.detectChanges();

      const sources = component.filterSources();
      expect(sources).toContain('Credit');
      expect(sources).toContain('Debit');
      expect(sources.length).toBe(2);
    });

    it('should return unique types only', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'A', type: 'Credit', amount: 10 },
        { name: 'Expense 2', date: new Date(), category: 'B', type: 'Credit', amount: 20 },
        { name: 'Expense 3', date: new Date(), category: 'C', type: 'Debit', amount: 30 },
        { name: 'Expense 4', date: new Date(), category: 'D', type: 'Cash', amount: 40 },
      ];

      component.data.set(testExpenses);
      fixture.detectChanges();

      const sources = component.filterSources();
      expect(sources).toEqual(jasmine.arrayContaining(['Credit', 'Debit', 'Cash']));
      expect(sources.length).toBe(3);
    });

    it('should return empty array when no expenses', () => {
      component.data.set([]);
      fixture.detectChanges();

      const sources = component.filterSources();
      expect(sources).toEqual([]);
    });
  });

  describe('RT-97-UT-014: Filter categories by type grouping', () => {
    it('should compute filter categories from expense data', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 100 },
        { name: 'Expense 2', date: new Date(), category: 'Food', type: 'Debit', amount: 50 },
        { name: 'Expense 3', date: new Date(), category: 'Groceries', type: 'Cash', amount: 75 },
      ];

      component.data.set(testExpenses);
      fixture.detectChanges();

      const categories = component.filterCategories();
      expect(categories).toContain('Groceries');
      expect(categories).toContain('Food');
      expect(categories.length).toBe(2);
    });

    it('should return unique categories only', () => {
      const testExpenses: Expense[] = [
        { name: 'E1', date: new Date(), category: 'A', type: 'Credit', amount: 10 },
        { name: 'E2', date: new Date(), category: 'A', type: 'Debit', amount: 20 },
        { name: 'E3', date: new Date(), category: 'B', type: 'Credit', amount: 30 },
      ];

      component.data.set(testExpenses);
      fixture.detectChanges();

      const categories = component.filterCategories();
      expect(categories).toContain('A');
      expect(categories).toContain('B');
      expect(categories.length).toBe(2);
    });
  });

  describe('RT-97-UT-015: Type-based filtering of data', () => {
    it('should filter expenses by selected type filter', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'A', type: 'Credit', amount: 10 },
        { name: 'Expense 2', date: new Date(), category: 'B', type: 'Debit', amount: 20 },
        { name: 'Expense 3', date: new Date(), category: 'C', type: 'Credit', amount: 30 },
      ];

      component.data.set(testExpenses);
      component.selectedSourceFilters.setValue(['Credit']);
      fixture.detectChanges();

      const filtered = component.filteredData();
      expect(filtered.length).toBe(2);
      filtered.forEach((exp) => {
        expect(exp.type).toBe('Credit');
      });
    });

    it('should return all expenses when no type filter is selected', () => {
      const testExpenses: Expense[] = [
        { name: 'Expense 1', date: new Date(), category: 'A', type: 'Credit', amount: 10 },
        { name: 'Expense 2', date: new Date(), category: 'B', type: 'Debit', amount: 20 },
      ];

      component.data.set(testExpenses);
      component.selectedSourceFilters.setValue([]);
      fixture.detectChanges();

      const filtered = component.filteredData();
      expect(filtered.length).toBe(2);
    });

    it('should filter by both category and type', () => {
      const testExpenses: Expense[] = [
        { name: 'E1', date: new Date(), category: 'Groceries', type: 'Credit', amount: 10 },
        { name: 'E2', date: new Date(), category: 'Groceries', type: 'Debit', amount: 20 },
        { name: 'E3', date: new Date(), category: 'Food', type: 'Credit', amount: 30 },
        { name: 'E4', date: new Date(), category: 'Food', type: 'Debit', amount: 40 },
      ];

      component.data.set(testExpenses);
      component.selectedFilters.setValue(['Groceries']);
      component.selectedSourceFilters.setValue(['Credit']);
      fixture.detectChanges();

      const filtered = component.filteredData();
      expect(filtered.length).toBe(1);
      expect(filtered[0].category).toBe('Groceries');
      expect(filtered[0].type).toBe('Credit');
    });
  });

  describe('RT-97-UT-016: Show/hide filters toggle', () => {
    it('should have showFilters signal', () => {
      expect(component.showFilters).toBeDefined();
    });

    it('should allow toggling filter visibility', () => {
      expect(component.showFilters()).toBe(false);
      component.showFilters.set(true);
      expect(component.showFilters()).toBe(true);
    });
  });

  describe('RT-97-UT-017: Selection model for bulk operations', () => {
    it('should have selection model initialized', () => {
      expect(component.selection).toBeDefined();
    });

    it('should allow selecting expenses', () => {
      const testExpenses: Expense[] = [
        { name: 'E1', date: new Date(), category: 'A', type: 'Credit', amount: 10, id: '1' },
        { name: 'E2', date: new Date(), category: 'B', type: 'Debit', amount: 20, id: '2' },
      ];

      component.data.set(testExpenses);
      component.selection.select(testExpenses[0]);

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(testExpenses[0])).toBe(true);
    });
  });
});
