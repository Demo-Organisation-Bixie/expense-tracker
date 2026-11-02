import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExpenseSettingsComponent } from '../../src/app/expense-settings/expense-settings.component';
import { ManageOptionsComponent } from '../../src/app/expense-settings/components/manage-options/manage-options.component';
import { ChipOption } from '../../src/app/expense-settings/interfaces/chip-option';
import { DatabaseService } from '../../src/app/core/services/database.service';
import { ExpenseDataService } from '../../src/app/core/services/expense-data.service';
import { UserService } from '../../src/app/core/services/user.service';

describe('Expense Settings and Manage Options Tests', () => {
  let component: ExpenseSettingsComponent;
  let fixture: ComponentFixture<ExpenseSettingsComponent>;

  const mockUserService = {
    getUser: jasmine.createSpy('getUser').and.returnValue({ email: 'test@example.com' }),
    getUserId: jasmine.createSpy('getUserId').and.returnValue('mock-user-id'),
  };

  const mockDatabaseService = {
    getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(
      Promise.resolve({
        toJSON: () => ({
          'mock-user-id': {
            firstName: 'Test',
            lastName: 'User',
            categories: { cat1: 'Groceries', cat2: 'Transport' },
            types: { type1: 'Credit', type2: 'Debit' },
          },
        }),
      })
    ),
    saveNewCategories: jasmine.createSpy('saveNewCategories').and.returnValue(Promise.resolve()),
    saveNewExpenseSourceTypes: jasmine.createSpy('saveNewExpenseSourceTypes').and.returnValue(Promise.resolve()),
    announceCategoriesAdded: jasmine.createSpy('announceCategoriesAdded'),
  };

  const mockExpenseDataService = {
    setCategoriesSignal: jasmine.createSpy('setCategoriesSignal'),
    setExpenseSourcesData: jasmine.createSpy('setExpenseSourcesData'),
  };

  const mockSnackBar = {
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpenseSettingsComponent,
        ManageOptionsComponent,
        ReactiveFormsModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ExpenseDataService, useValue: mockExpenseDataService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // RT-96-UT-007: Test ExpenseSettingsComponent ngOnInit loads user types
  it('RT-96-UT-007 | RT-97 | ExpenseSettingsComponent ngOnInit loads user types | Risk: High', () => {
    expect(mockUserService.getUser).toHaveBeenCalled();
    expect(mockDatabaseService.getUserDetails).toHaveBeenCalledWith('test@example.com');
    expect(component.sourceTypeSignal().length).toBeGreaterThan(0);
    const types = component.sourceTypeSignal().map((opt: ChipOption) => opt.value);
    expect(types).toContain('Credit');
    expect(types).toContain('Debit');
  });

  // RT-96-UT-008: Test ExpenseSettingsComponent saveTypes method
  it('RT-96-UT-008 | RT-97 | ExpenseSettingsComponent saveTypes method saves types to database | Risk: High', () => {
    component.sourceTypeSignal.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
      { value: 'Cash', removable: true },
    ]);

    component.saveTypes();

    expect(mockDatabaseService.saveNewExpenseSourceTypes).toHaveBeenCalledWith(
      ['Credit', 'Debit', 'Cash'],
      'mock-user-id'
    );
    expect(mockExpenseDataService.setExpenseSourcesData).toHaveBeenCalledWith(['Credit', 'Debit', 'Cash']);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Expense Source Types saved!');
  });

  // RT-96-UT-009: Test ExpenseSettingsComponent setSourceTypeOptions method
  it('RT-96-UT-009 | RT-97 | ExpenseSettingsComponent setSourceTypeOptions method populates type options | Risk: Medium', () => {
    component['setSourceTypeOptions'](['Credit', 'Debit', 'Cash']);

    const options = component.sourceTypeSignal();
    expect(options.length).toBe(3);
    expect(options[0].value).toBe('Credit');
    expect(options[0].removable).toBe(false);
    expect(options[2].value).toBe('Cash');
    expect(options[2].removable).toBe(true);
  });

  // RT-96-UT-010: Test ManageOptionsComponent onOptionEntered adds new type
  it('RT-96-UT-010 | RT-97 | ManageOptionsComponent onOptionEntered adds new type | Risk: Medium', () => {
    TestBed.configureTestingModule({
      imports: [ManageOptionsComponent],
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });

    const manageFixture = TestBed.createComponent(ManageOptionsComponent);
    const manageComponent = manageFixture.componentInstance;
    manageComponent.options.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ]);
    manageComponent.originalOptions.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ]);
    manageFixture.detectChanges();

    const mockEvent = {
      value: 'Crypto',
      chip: { remove: () => {} },
      input: { value: '' } as HTMLInputElement,
    } as any;

    manageComponent.onOptionEntered(mockEvent);

    const options = manageComponent.options();
    expect(options.length).toBe(3);
    expect(options[2].value).toBe('Crypto');
  });

  // RT-96-UT-011: Test ManageOptionsComponent onOptionRemove removes type
  it('RT-96-UT-011 | RT-97 | ManageOptionsComponent onOptionRemove removes type | Risk: Medium', () => {
    TestBed.configureTestingModule({
      imports: [ManageOptionsComponent],
    });

    const manageFixture = TestBed.createComponent(ManageOptionsComponent);
    const manageComponent = manageFixture.componentInstance;
    manageComponent.options.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: true },
      { value: 'Cash', removable: true },
    ]);
    manageFixture.detectChanges();

    manageComponent.onOptionRemove({ value: 'Debit', removable: true });

    const options = manageComponent.options();
    expect(options.length).toBe(2);
    expect(options.find((o: ChipOption) => o.value === 'Debit')).toBeUndefined();
  });

  // RT-96-UT-012: Test ManageOptionsComponent resetOptions restores original types
  it('RT-96-UT-012 | RT-97 | ManageOptionsComponent resetOptions restores original types | Risk: Medium', () => {
    TestBed.configureTestingModule({
      imports: [ManageOptionsComponent],
    });

    const manageFixture = TestBed.createComponent(ManageOptionsComponent);
    const manageComponent = manageFixture.componentInstance;
    manageComponent.options.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: true },
    ]);
    manageComponent.originalOptions.set([
      { value: 'Credit', removable: false },
      { value: 'Debit', removable: false },
    ]);
    manageFixture.detectChanges();

    manageComponent.options.set([
      { value: 'Credit', removable: false },
      { value: 'Cash', removable: true },
    ]);
    manageFixture.detectChanges();

    manageComponent.resetOptions();

    const options = manageComponent.options();
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('Credit');
    expect(options[1].value).toBe('Debit');
  });
});
