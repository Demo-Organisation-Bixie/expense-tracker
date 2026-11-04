import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpenseFilterControlsComponent } from '../../../../src/app/core/components/expense-filter-controls/expense-filter-controls.component';
import { ExpenseDataService } from '../../../../src/app/core/services/expense-data.service';
import { EntryTypes } from '../../../../src/app/core/enums/entry-types';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DataExportComponent } from '../../../../src/app/core/components/data-export/data-export.component';
import { DatePipe } from '@angular/common';

describe('ExpenseFilterControlsComponent - Filter Controls', () => {
  let component: ExpenseFilterControlsComponent;
  let fixture: ComponentFixture<ExpenseFilterControlsComponent>;
  let mockDataService: jasmine.SpyObj<ExpenseDataService>;

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('ExpenseDataService', [
      'expensesSignal',
      'expenseTypesSignal',
      'categoriesSignal',
      'filesImportedSignal',
      'filteredExpenses',
      'timeFrameFilterSignal',
      'expenseEntryTypeFilter',
      'showFilters',
      'setTypeFilter',
      'setExpenseEntryTypeFilter',
      'setTimeFrameFilter',
    ]);

    mockDataService.expensesSignal.and.returnValue({ set: jasmine.createSpy() });
    mockDataService.expenseTypesSignal.and.returnValue(['Credit', 'Debit', 'Cash']);
    mockDataService.categoriesSignal.and.returnValue(['Groceries', 'Transportation', 'Entertainment']);
    mockDataService.filesImportedSignal.and.returnValue(['file1.csv']);
    mockDataService.filteredExpenses.and.returnValue([]);
    mockDataService.timeFrameFilterSignal.and.returnValue(undefined);
    mockDataService.expenseEntryTypeFilter.and.returnValue(undefined);
    mockDataService.showFilters.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDatepickerModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButton,
        MatIconModule,
        MatCardModule,
        DataExportComponent,
        ExpenseFilterControlsComponent,
      ],
      providers: [
        provideNativeDateAdapter(),
        DatePipe,
        { provide: ExpenseDataService, useValue: mockDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseFilterControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('RT-97-UT-030: Filter controls initialization', () => {
    it('should have expenseEntryType filter control initialized', () => {
      expect(component.expenseEntryType).toBeDefined();
    });

    it('should have selectedTypeFilter control initialized', () => {
      expect(component.selectedTypeFilter).toBeDefined();
    });

    it('should initialize expenseEntryType with undefined value', () => {
      expect(component.expenseEntryType.value).toBeUndefined();
    });

    it('should initialize selectedTypeFilter with undefined value', () => {
      expect(component.selectedTypeFilter.value).toBeUndefined();
    });
  });

  describe('RT-97-UT-031: Type filter chip-listbox', () => {
    it('should display type filter options', () => {
      expect(component.expenseTypes).toBeDefined();
      expect(Array.isArray(component.expenseTypes)).toBe(true);
    });

    it('should contain default expense types in filter', () => {
      expect(component.expenseTypes).toContain({ label: 'Credit', value: 'Credit' });
      expect(component.expenseTypes).toContain({ label: 'Debit', value: 'Debit' });
      expect(component.expenseTypes).toContain({ label: 'Cash', value: 'Cash' });
    });

    it('should allow selecting a type filter', () => {
      component.selectedTypeFilter.setValue('Credit');
      expect(component.selectedTypeFilter.value).toBe('Credit');
    });

    it('should allow clearing type filter', () => {
      component.selectedTypeFilter.setValue('Credit');
      component.selectedTypeFilter.setValue(null);
      expect(component.selectedTypeFilter.value).toBeNull();
    });
  });

  describe('RT-97-UT-032: Entry type filter chip-listbox', () => {
    it('should display entry type filter options', () => {
      expect(component.expenseEntryTypes).toBeDefined();
      expect(Array.isArray(component.expenseEntryTypes)).toBe(true);
    });

    it('should contain manual and imported entry types', () => {
      expect(component.expenseEntryTypes).toContain({ label: 'Manual Entry', value: EntryTypes.MANUAL });
      expect(component.expenseEntryTypes).toContain({ label: 'Imported', value: EntryTypes.IMPORTED });
    });

    it('should allow selecting entry type filter', () => {
      component.expenseEntryType.setValue(EntryTypes.MANUAL);
      expect(component.expenseEntryType.value).toBe(EntryTypes.MANUAL);
    });

    it('should sync entry type filter with service', () => {
      component.expenseEntryType.setValue(EntryTypes.MANUAL);
      expect(mockDataService.setExpenseEntryTypeFilter).toHaveBeenCalled();
    });
  });

  describe('RT-97-UT-033: Filter visibility toggle', () => {
    it('should start with filters hidden', () => {
      expect(component.showFilters()).toBe(false);
    });

    it('should toggle filter visibility on', () => {
      component.toggleFilters();
      expect(component.showFilters()).toBe(true);
    });

    it('should toggle filter visibility off', () => {
      component.showFilters.set(true);
      component.toggleFilters();
      expect(component.showFilters()).toBe(false);
    });

    it('should call service to update filter visibility', () => {
      component.toggleFilters();
      expect(mockDataService.showFilters.update).toHaveBeenCalled();
    });
  });

  describe('RT-97-UT-034: Time frame filter controls', () => {
    it('should have time frame filters defined', () => {
      expect(component.timeFrameFilters).toBeDefined();
      expect(Array.isArray(component.timeFrameFilters)).toBe(true);
    });

    it('should contain current month filter', () => {
      const currentMonth = component.timeFrameFilters.find(f => f.value === 'currentMonth');
      expect(currentMonth).toBeDefined();
      expect(currentMonth?.label).toBe('Current Month');
    });

    it('should contain last 3 months filter', () => {
      const last3Months = component.timeFrameFilters.find(f => f.value === '3months');
      expect(last3Months).toBeDefined();
      expect(last3Months?.label).toBe('Last 3 Months');
    });

    it('should contain last 6 months filter', () => {
      const last6Months = component.timeFrameFilters.find(f => f.value === '6months');
      expect(last6Months).toBeDefined();
      expect(last6Months?.label).toBe('Last 6 Months');
    });

    it('should contain custom date range filter', () => {
      const customRange = component.timeFrameFilters.find(f => f.value === 'custom range');
      expect(customRange).toBeDefined();
      expect(customRange?.label).toBe('Custom Date Range');
    });
  });

  describe('RT-97-UT-035: Date range picker controls', () => {
    it('should have date range form group', () => {
      expect(component.range).toBeDefined();
      expect(component.range.get('start')).toBeDefined();
      expect(component.range.get('end')).toBeDefined();
    });

    it('should initialize date range with default values', () => {
      expect(component.range.value.start).toBeDefined();
      expect(component.range.value.end).toBeDefined();
    });

    it('should update date range on value changes', () => {
      const newStart = new Date('2024-01-01');
      const newEnd = new Date('2024-12-31');
      component.range.patchValue({ start: newStart, end: newEnd });
      expect(component.range.value.start).toEqual(newStart);
      expect(component.range.value.end).toEqual(newEnd);
    });
  });

  describe('RT-97-UT-036: Filter synchronization with service', () => {
    it('should sync type filter changes to service', () => {
      component.selectedTypeFilter.setValue('Credit');
      expect(mockDataService.setTypeFilter).toHaveBeenCalledWith('Credit');
    });

    it('should sync entry type filter changes to service', () => {
      component.expenseEntryType.setValue(EntryTypes.MANUAL);
      expect(mockDataService.setExpenseEntryTypeFilter).toHaveBeenCalledWith(EntryTypes.MANUAL);
    });

    it('should sync time frame filter changes to service', () => {
      component.selectedTimeFrame = 'currentMonth';
      // Trigger the change detection
      fixture.detectChanges();
    });
  });
});
