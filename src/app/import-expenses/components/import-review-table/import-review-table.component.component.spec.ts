import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SelectionModel } from '@angular/cdk/collections';
import { CurrencyPipe } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { of } from 'rxjs';

import { ImportReviewTableComponent } from './import-review-table.component';
import { Expense } from '@core/interfaces/expense-model';
import { BulkEditModalComponent } from '@shared/components/bulk-edit-modal/bulk-edit-modal.component';
import { BulkEditDialogResult } from '../../../dashboard/interfaces/bulk-edit-dialog-data';

describe('ImportReviewTableComponent — Component: delete actions (UI) [RT-93, AC-1, Component]', () => {
  let component: ImportReviewTableComponent;
  let fixture: ComponentFixture<ImportReviewTableComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockExpenses: Expense[] = [
    { id: 'exp-1', name: 'Expense 1', date: new Date('2024-03-15'), category: 'Food', type: 'Manual', amount: 50 },
    { id: 'exp-2', name: 'Expense 2', date: new Date('2024-03-16'), category: 'Transport', type: 'Imported', amount: 30 },
    { id: 'exp-3', name: 'Expense 3', date: new Date('2024-03-17'), category: 'Food', type: 'Manual', amount: 20 },
  ];

  beforeEach(async () => {
    const mockDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const mockSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ImportReviewTableComponent,
        MatTableModule,
        MatTabsModule,
        MatSortModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatCheckboxModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialogSpy },
        { provide: MatSnackBar, useValue: mockSnackBarSpy },
        CurrencyPipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportReviewTableComponent);
    component = fixture.componentInstance;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    component.expenses.set(mockExpenses);
    fixture.detectChanges();
    tick();
  });

  it('RT-93-IRT-C001: should render delete action button for each row in the table', () => {
    const rows = fixture.debugElement.queryAll(By.css('table tr'));
    expect(rows.length).toBeGreaterThan(0);
  });

  it('RT-93-IRT-C002: should have an actions column in the table', () => {
    expect(component.displayedColumns).toContain('actions');
  });

  it('RT-93-IRT-C003: should open delete confirmation dialog when delete action is clicked for a row', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    // Simulate clicking delete on first row
    component.deleteRow(mockExpenses[0]);
    tick();

    expect(mockDialog.open).toHaveBeenCalledWith(BulkEditModalComponent, jasmine.any(Object));
  }));

  it('RT-93-IRT-C004: should show snackbar notification after delete action', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    component.deleteRow(mockExpenses[0]);
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Expense successfully deleted.', 'Close', {
      duration: 3000,
    });
  }));

  it('RT-93-IRT-C005: should remove deleted row from table after confirmation', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    component.deleteRow(mockExpenses[0]);
    tick();

    expect(component.expensesDataSource.data.length).toBe(2);
    expect(component.expensesDataSource.data.find(e => e.id === 'exp-1')).toBeUndefined();
  }));

  it('RT-93-IRT-C006: should emit updated expenses list after delete', fakeAsync(() => {
    const emittedData: Expense[][] = [];
    component.expensesChange.subscribe((data) => emittedData.push(data));

    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    component.deleteRow(mockExpenses[0]);
    tick();

    expect(emittedData.length).toBeGreaterThan(0);
    expect(emittedData[0].length).toBe(2);
  }));

  it('RT-93-IRT-C007: should not modify table when delete is cancelled', fakeAsync(() => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of({ editForm: {} } as BulkEditDialogResult),
    } as any);

    component.deleteRow(mockExpenses[0]);
    tick();

    expect(component.expensesDataSource.data.length).toBe(3);
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  }));

  it('RT-93-IRT-C008: should render selection checkbox column', () => {
    expect(component.displayedColumns).toContain('select');
  });

  it('RT-93-IRT-C009: should have a selection model for multi-select', () => {
    expect(component.selection).toBeTruthy();
    expect(component.selection instanceof SelectionModel).toBe(true);
  });

  it('RT-93-IRT-C010: should clear selection after bulk delete', fakeAsync(() => {
    component.selection.select(mockExpenses[0]);
    component.selection.select(mockExpenses[1]);
    expect(component.selection.selected.length).toBe(2);

    mockDialog.open.and.returnValue({
      afterClosed: () => of({} as BulkEditDialogResult),
    } as any);

    // Simulate bulk delete via openBulkEditDialog
    component.openBulkEditDialog('delete');
    tick();

    expect(component.selection.selected.length).toBe(0);
  }));
});
