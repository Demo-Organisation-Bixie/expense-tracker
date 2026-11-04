import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { EntryTypes } from '@core/enums/entry-types';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { TimeFrameFilter } from '../interfaces/time-frame-filter';
import { Expense } from '../interfaces/expense-model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseDataService {
  private readonly _showFilters = signal(false);
  private readonly _expensesSignal = signal<Expense[]>([]);
  private readonly _sourceTypesSignal = signal<string[]>([]);
  private readonly _categoriesSignal = signal<string[]>([]);
  private readonly _timeFrameFilter = signal<TimeFrameFilter | undefined>(undefined);
  private readonly _filesImported = signal<string[]>([]);
  private readonly _expenseEntryTypeFilter = signal<string | undefined>(undefined);
  private readonly _expenseTypesSignal = signal<string[]>(['Credit', 'Debit', 'Cash']);
  private readonly _typeFilterSignal = signal<string | undefined>(undefined);

  readonly filteredExpenses = computed(() => {
    const timeFilter = this._timeFrameFilter();
    const entryTypeFilter = this._expenseEntryTypeFilter();
    const typeFilter = this._typeFilterSignal();
    let expenses = this.filterExpensesByEntryType(this._expensesSignal(), entryTypeFilter);
    expenses = this.filterByType(expenses, typeFilter);

    if (!timeFilter || !expenses.length) {
      return expenses;
    }

    if (timeFilter.customDateRange) {
      return this.filterByCustomDateRange(expenses, timeFilter);
    }

    return this.filterByTimeFrame(expenses, timeFilter);
  });

  private filterExpensesByDateInterval(expenses: Expense[], start: Date, end: Date): Expense[] {
    const interval = {
      start: startOfDay(start),
      end: endOfDay(end),
    };

    return expenses.filter((expense) => {
      const expenseDate = this.parseExpenseDate(expense);
      return isWithinInterval(expenseDate, interval);
    });
  }

  private parseExpenseDate(expense: Expense): Date {
    return expense.date instanceof Date ? expense.date : new Date(expense.date);
  }

  private filterExpensesByEntryType(expenses: Expense[], entryTypeFilter: string | undefined): Expense[] {
    if (!entryTypeFilter) {
      return expenses;
    }

    if (entryTypeFilter === EntryTypes.MANUAL) {
      return expenses.filter((expense) => !expense.importedOn);
    }

    return expenses.filter((expense) => expense?.importedOn);
  }

  private filterByType(expenses: Expense[], typeFilter: string | undefined): Expense[] {
    if (!typeFilter) {
      return expenses;
    }
    return expenses.filter((expense) => expense.type === typeFilter);
  }

  groupExpensesByType(expenses: Expense[]): Map<string, Expense[]> {
    const grouped = new Map<string, Expense[]>();
    for (const expense of expenses) {
      const type = expense.type || 'Uncategorized';
      const existing = grouped.get(type) || [];
      existing.push(expense);
      grouped.set(type, existing);
    }
    return grouped;
  }

  private filterByCustomDateRange(expenses: Expense[], timeFilter: TimeFrameFilter): Expense[] {
    const { customDateRange } = timeFilter;
    const { start, end } = customDateRange ?? {};

    if (!start || !end) {
      return expenses;
    }

    return this.filterExpensesByDateInterval(expenses, start, end);
  }

  private filterByTimeFrame(expenses: Expense[], timeFilter: TimeFrameFilter): Expense[] {
    const { start, end } = timeFilter.getDates();

    if (!start || !end) {
      return expenses;
    }

    return this.filterExpensesByDateInterval(expenses, start, end);
  }

  get expensesSignal(): WritableSignal<Expense[]> {
    return this._expensesSignal;
  }

  get expenseSourcesSignal(): WritableSignal<string[]> {
    return this._sourceTypesSignal;
  }

  get categoriesSignal(): WritableSignal<string[]> {
    return this._categoriesSignal;
  }

  get timeFrameFilterSignal(): WritableSignal<TimeFrameFilter | undefined> {
    return this._timeFrameFilter;
  }

  get filesImportedSignal(): WritableSignal<string[]> {
    return this._filesImported;
  }

  get expenseEntryTypeFilter(): WritableSignal<string | undefined> {
    return this._expenseEntryTypeFilter;
  }

  get expenseTypesSignal(): WritableSignal<string[]> {
    return this._expenseTypesSignal;
  }

  get showFilters(): WritableSignal<boolean> {
    return this._showFilters;
  }

  setExpensesData(expenses: Expense[]) {
    this._expensesSignal.set(expenses);
  }

  setExpenseSourcesData(expenseSources: string[]) {
    this._sourceTypesSignal.set(expenseSources);
  }

  setCategoriesSignal(categories: string[]) {
    this._categoriesSignal.set(categories);
  }

  setTimeFrameFilter(timeFrameFilter: TimeFrameFilter | undefined) {
    this._timeFrameFilter.set(timeFrameFilter);
  }

  setFilesImported(files: string[]) {
    this._filesImported.set(files);
  }

  setExpenseEntryTypeFilter(type: string | undefined) {
    this._expenseEntryTypeFilter.set(type);
  }

  setTypeFilter(type: string | undefined) {
    this._typeFilterSignal.set(type);
  }

  addExpenseType(type: string): void {
    const current = this._expenseTypesSignal();
    if (!current.includes(type)) {
      this._expenseTypesSignal.set([...current, type]);
    }
  }

  removeExpenseType(type: string): void {
    const current = this._expenseTypesSignal();
    this._expenseTypesSignal.set(current.filter((t) => t !== type));
  }

  updateExpenseType(oldType: string, newType: string): void {
    const current = this._expenseTypesSignal();
    this._expenseTypesSignal.set(current.map((t) => (t === oldType ? newType : t)));
  }
}
