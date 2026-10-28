import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireDatabase, AngularFireModule } from '@angular/fire/compat/database';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { DatabaseService } from './database.service';

describe('DatabaseService — Unit: deleteExpense() [RT-93, AC-1, Unit]', () => {
  let service: DatabaseService;
  let mockDb: jasmine.SpyObj<AngularFireDatabase>;

  beforeEach(() => {
    const mockDbSpy = jasmine.createSpyObj('AngularFireDatabase', ['list', 'database']);
    mockDbSpy.database = {
      ref: jasmine.createSpy('ref').and.returnValue({
        update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      }),
    };

    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({ projectId: 'test-project' }),
        AngularFireDatabaseModule,
      ],
      providers: [
        DatabaseService,
        { provide: AngularFireDatabase, useValue: mockDbSpy },
      ],
    });

    service = TestBed.inject(DatabaseService);
    mockDb = TestBed.inject(AngularFireDatabase) as jasmine.SpyObj<AngularFireDatabase>;
  });

  it('RT-93-DS001: should call AngularFireDatabase.list().remove() with the correct path', fakeAsync(() => {
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.resolve());
    mockDb.list.and.returnValue(mockListRef as any);

    service.deleteExpense('user-456', 'expense-789');
    tick();

    expect(mockDb.list).toHaveBeenCalledWith('users/user-456/expenses');
    expect(mockListRef.remove).toHaveBeenCalledWith('expense-789');
  }));

  it('RT-93-DS002: should return a Promise that resolves on successful remove', fakeAsync(() => {
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.resolve());
    mockDb.list.and.returnValue(mockListRef as any);

    let resolved = false;
    service.deleteExpense('user-456', 'expense-789').then(() => {
      resolved = true;
    });
    tick();

    expect(resolved).toBe(true);
  }));

  it('RT-93-DS003: should return a Promise that rejects when remove fails', fakeAsync(() => {
    const testError = new Error('Firebase remove failed');
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.reject(testError));
    mockDb.list.and.returnValue(mockListRef as any);

    let rejected = false;
    service.deleteExpense('user-456', 'expense-789').catch(() => {
      rejected = true;
    });
    tick();

    expect(rejected).toBe(true);
  }));

  it('RT-93-DS004: should construct the correct Firebase path for user expenses', fakeAsync(() => {
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.resolve());
    mockDb.list.and.returnValue(mockListRef as any);

    service.deleteExpense('user-abc-123', 'expense-def-456');
    tick();

    expect(mockDb.list).toHaveBeenCalledWith('users/user-abc-123/expenses');
  }));

  it('RT-93-DS005: should pass the expense key to remove()', fakeAsync(() => {
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.resolve());
    mockDb.list.and.returnValue(mockListRef as any);

    service.deleteExpense('user-456', 'expense-key-xyz');
    tick();

    expect(mockListRef.remove).toHaveBeenCalledWith('expense-key-xyz');
  }));

  it('RT-93-DS006: should handle empty expense id', fakeAsync(() => {
    const mockListRef = jasmine.createSpyObj('ListObservable', ['remove']);
    mockListRef.remove.and.returnValue(Promise.resolve());
    mockDb.list.and.returnValue(mockListRef as any);

    service.deleteExpense('user-456', '');
    tick();

    expect(mockDb.list).toHaveBeenCalledWith('users/user-456/expenses');
    expect(mockListRef.remove).toHaveBeenCalledWith('');
  }));
});
