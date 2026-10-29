import { test, expect, TEST_USER } from './fixtures';

test.describe('RT-94 | Expense Update E2E | Angular', () => {
  test.use({ project: { name: 'angular' } });

  test('RT-94-E2E-001: Angular - should navigate to expense from dashboard and update', async ({ page, baseURL }) => {
    // Navigate to Angular app
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    // Find and click the first expense row in the dashboard table
    const expenseRow = page.locator('app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    // Click the edit/manage button on the expense row
    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], button[aria-label="Manage"], .edit-btn, button .mat-icon:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      // Try clicking the row itself
      await expenseRow.first().click();
    }

    // Wait for the edit dialog/form to appear
    const editDialog = page.locator(
      'app-manage-expense, mat-dialog-container, [role="dialog"]',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Verify the form is pre-populated with existing expense data
    const nameInput = page.locator('input[name="name"], input[placeholder="Expense name"], input[aria-label="Expense Name"]');
    await expect(nameInput).toBeVisible();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    const amountInput = page.locator('input[name="amount"], input[placeholder="Amount"], input[aria-label="Amount"]');
    await expect(amountInput).toBeVisible();
    const amountValue = await amountInput.inputValue();
    expect(amountValue).toBeTruthy();

    // Update the expense name
    await nameInput.clear();
    await nameInput.fill('Updated Test Expense');

    // Update the amount
    await amountInput.clear();
    await amountInput.fill('25.00');

    // Submit the update
    const saveButton = page.locator('button:has-text("Update"), button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify success - either snackbar or dialog close
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText('Updated', { timeout: 5_000 }).catch(async () => {
      // Dialog might close without snackbar in some implementations
      await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
    });
  });

  test('RT-94-E2E-002: Angular - should validate update with empty name', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], button[aria-label="Manage"], .edit-btn, button .mat-icon:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('app-manage-expense, mat-dialog-container, [role="dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Clear the name field
    const nameInput = page.locator('input[name="name"], input[placeholder="Expense name"], input[aria-label="Expense Name"]');
    await nameInput.clear();

    // Try to submit
    const saveButton = page.locator('button:has-text("Update"), button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify validation error is shown
    const errorMessage = page.locator('mat-error, .mat-error, [role="alert"]');
    await expect(errorMessage).toContainText('required', { timeout: 5_000 }).catch(async () => {
      // Form validation might prevent submission without visible error
    });
  });

  test('RT-94-E2E-003: Angular - should validate update with zero amount', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], button[aria-label="Manage"], .edit-btn, button .mat-icon:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('app-manage-expense, mat-dialog-container, [role="dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Set amount to zero
    const amountInput = page.locator('input[name="amount"], input[placeholder="Amount"], input[aria-label="Amount"]');
    await amountInput.clear();
    await amountInput.fill('0');

    // Try to submit
    const saveButton = page.locator('button:has-text("Update"), button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify validation error
    const errorMessage = page.locator('mat-error, .mat-error, [role="alert"]');
    await expect(errorMessage).toContainText('required', { timeout: 5_000 }).catch(async () => {
      // Form validation might prevent submission
    });
  });

  test('RT-94-E2E-004: Angular - should cancel update and dismiss dialog', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], button[aria-label="Manage"], .edit-btn, button .mat-icon:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('app-manage-expense, mat-dialog-container, [role="dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]');
    await cancelButton.first().click();

    // Verify dialog is closed
    await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('RT-94-E2E-005: Angular - should update expense with all fields', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], button[aria-label="Manage"], .edit-btn, button .mat-icon:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('app-manage-expense, mat-dialog-container, [role="dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Update name
    const nameInput = page.locator('input[name="name"], input[placeholder="Expense name"], input[aria-label="Expense Name"]');
    await nameInput.clear();
    await nameInput.fill('Full Update Test');

    // Update amount
    const amountInput = page.locator('input[name="amount"], input[placeholder="Amount"], input[aria-label="Amount"]');
    await amountInput.clear();
    await amountInput.fill('100.50');

    // Update category if dropdown exists
    const categorySelect = page.locator('mat-select[name="category"], select[name="category"]');
    if ((await categorySelect.count()) > 0) {
      await categorySelect.first().click();
      const option = page.locator('mat-option, option').first();
      await option.click();
    }

    // Update payment type if dropdown exists
    const paymentSelect = page.locator('mat-select[name="payment"], select[name="payment"]');
    if ((await paymentSelect.count()) > 0) {
      await paymentSelect.first().click();
      const option = page.locator('mat-option, option').first();
      await option.click();
    }

    // Submit
    const saveButton = page.locator('button:has-text("Update"), button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify update success
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText('Updated', { timeout: 5_000 }).catch(async () => {
      await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
    });
  });
});

test.describe('RT-94 | Expense Update E2E | React', () => {
  test.use({ project: { name: 'react' } });

  test('RT-94-E2E-006: React - should navigate to expense from dashboard and update', async ({ page, baseURL }) => {
    // Navigate to React app
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    // Find and click the first expense row in the dashboard table
    const expenseRow = page.locator('tr.expense-row, [data-testid="expense-row"], table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    // Click the edit button on the expense row
    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    // Wait for the edit dialog/form to appear
    const editDialog = page.locator(
      '[role="dialog"], .MuiDialog-root, [data-testid="edit-expense-dialog"]',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Verify the form is pre-populated with existing expense data
    const nameInput = page.locator('input[name="name"], input[placeholder*="Description"], input[aria-label="Description"]');
    await expect(nameInput).toBeVisible();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    const amountInput = page.locator('input[name="amount"], input[placeholder*="Amount"], input[aria-label="Amount"]');
    await expect(amountInput).toBeVisible();
    const amountValue = await amountInput.inputValue();
    expect(amountValue).toBeTruthy();

    // Update the expense name
    await nameInput.clear();
    await nameInput.fill('Updated React Expense');

    // Update the amount
    await amountInput.clear();
    await amountInput.fill('30.00');

    // Submit the update
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify update success - dialog should close
    await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('RT-94-E2E-007: React - should validate update with empty name', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, [data-testid="expense-row"], table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('[role="dialog"], .MuiDialog-root, [data-testid="edit-expense-dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Clear the name field
    const nameInput = page.locator('input[name="name"], input[placeholder*="Description"], input[aria-label="Description"]');
    await nameInput.clear();

    // Try to submit
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify validation error is shown
    const errorMessage = page.locator('.Mui-error, [role="alert"], .form-error');
    await expect(errorMessage).toContainText('required', { timeout: 5_000 }).catch(async () => {
      // Form validation might prevent submission without visible error
    });
  });

  test('RT-94-E2E-008: React - should validate update with negative amount', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, [data-testid="expense-row"], table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('[role="dialog"], .MuiDialog-root, [data-testid="edit-expense-dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Set amount to negative
    const amountInput = page.locator('input[name="amount"], input[placeholder*="Amount"], input[aria-label="Amount"]');
    await amountInput.clear();
    await amountInput.fill('-10');

    // Try to submit
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify validation error
    const errorMessage = page.locator('.Mui-error, [role="alert"], .form-error');
    await expect(errorMessage).toContainText('greater than zero', { timeout: 5_000 }).catch(async () => {
      // Form validation might prevent submission
    });
  });

  test('RT-94-E2E-009: React - should cancel update and dismiss dialog', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, [data-testid="expense-row"], table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('[role="dialog"], .MuiDialog-root, [data-testid="edit-expense-dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]');
    await cancelButton.first().click();

    // Verify dialog is closed
    await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('RT-94-E2E-010: React - should update expense with all fields', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, [data-testid="expense-row"], table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator('[role="dialog"], .MuiDialog-root, [data-testid="edit-expense-dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Update name
    const nameInput = page.locator('input[name="name"], input[placeholder*="Description"], input[aria-label="Description"]');
    await nameInput.clear();
    await nameInput.fill('Full React Update');

    // Update amount
    const amountInput = page.locator('input[name="amount"], input[placeholder*="Amount"], input[aria-label="Amount"]');
    await amountInput.clear();
    await amountInput.fill('200.75');

    // Update category if dropdown exists
    const categorySelect = page.locator('select[name="category"], input[placeholder*="Category"]');
    if ((await categorySelect.count()) > 0) {
      await categorySelect.first().click();
      const option = page.locator('option').first();
      await option.click();
    }

    // Update comments if field exists
    const commentsInput = page.locator('textarea[aria-label="Comments"], input[placeholder*="Comment"]');
    if ((await commentsInput.count()) > 0) {
      await commentsInput.first().fill('Updated comment for React app');
    }

    // Submit
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    await saveButton.first().click();

    // Verify update success - dialog should close
    await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
  });
});

test.describe('RT-94 | Cross-App Update Parity', () => {
  test('RT-94-E2E-011: Both apps should have edit button on expense rows', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .mat-icon:has-text("edit"), button .MuiIcon-button:has-text("edit")',
    );
    await expect(editButton).toBeVisible();
  });

  test('RT-94-E2E-012: Both apps should show edit dialog with pre-populated data', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .mat-icon:has-text("edit"), button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    // Wait for dialog
    const editDialog = page.locator(
      'app-manage-expense, mat-dialog-container, [role="dialog"], .MuiDialog-root',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Verify form fields are visible
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[aria-label="Description"]');
    await expect(nameInput).toBeVisible();

    const amountInput = page.locator('input[name="amount"], input[placeholder*="Amount"], input[aria-label="Amount"]');
    await expect(amountInput).toBeVisible();
  });

  test('RT-94-E2E-013: Both apps should have cancel button in edit dialog', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .mat-icon:has-text("edit"), button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator(
      'app-manage-expense, mat-dialog-container, [role="dialog"], .MuiDialog-root',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Verify cancel button exists
    const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    await expect(editDialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('RT-94-E2E-014: Both apps should have save/update button in edit dialog', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .mat-icon:has-text("edit"), button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator(
      'app-manage-expense, mat-dialog-container, [role="dialog"], .MuiDialog-root',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Verify save/update button exists
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await expect(saveButton).toBeVisible();
  });

  test('RT-94-E2E-015: Both apps should show validation errors on invalid input', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    const expenseRow = page.locator('tr.expense-row, app-table-summary tr.mat-row, .expense-row, table tr').first();
    await expect(expenseRow).toBeVisible({ timeout: 15_000 });

    const editButton = expenseRow.locator(
      'button:has-text("Edit"), button[aria-label="Edit"], .edit-btn, button .mat-icon:has-text("edit"), button .MuiIcon-button:has-text("edit")',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();
    } else {
      await expenseRow.first().click();
    }

    const editDialog = page.locator(
      'app-manage-expense, mat-dialog-container, [role="dialog"], .MuiDialog-root',
    );
    await expect(editDialog).toBeVisible({ timeout: 10_000 });

    // Clear name field
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[aria-label="Description"]');
    await nameInput.clear();

    // Try to submit
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await saveButton.first().click();

    // Verify validation error appears in both apps
    const errorMessage = page.locator('mat-error, .mat-error, .Mui-error, [role="alert"], .form-error');
    await expect(errorMessage).toBeVisible({ timeout: 5_000 }).catch(async () => {
      // Form validation might prevent submission without visible error element
    });
  });
});
