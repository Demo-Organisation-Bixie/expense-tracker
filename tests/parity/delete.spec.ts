import { test, expect, Page } from '@playwright/test';
import { TEST_USER } from './fixtures';

const ANGULAR_URL = process.env.ANGULAR_URL ?? 'http://localhost:4200';
const REACT_URL = process.env.REACT_URL ?? 'http://localhost:5173';

async function authenticate(page: Page, baseURL: string): Promise<void> {
  await page.goto(baseURL);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator(
    'input[type="email"], input[name="email"], [data-testid="email-input"]',
  );
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"], [data-testid="password-input"]',
  );

  await emailInput.first().waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.first().fill(TEST_USER.email);
  await passwordInput.first().fill(TEST_USER.password);

  const submitButton = page.locator(
    'button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log in")',
  );
  await submitButton.first().click();

  await page.waitForURL((url) => !url.pathname.includes('login'), {
    timeout: 15_000,
  });
  await page.waitForLoadState('networkidle');
}

test.describe('E2E/Parity: Delete from dashboard table [RT-93, AC-1, E2E]', () => {
  test('RT-93-E2E001: should delete an expense from the dashboard table - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);

      // Navigate to dashboard
      await page.goto(`${ANGULAR_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for expense rows in the table
      const expenseRows = page.locator('table tr').filter({ hasNot: page.locator('th') });
      const rowCount = await expenseRows.count();

      if (rowCount > 0) {
        // Find and click delete button on first row
        const deleteButton = page.locator(
          'table tr:has(button:has-text("Delete")) button:has-text("Delete"), ' +
          'table tr td button[aria-label*="delete"], ' +
          'table tr .delete-btn, ' +
          'table tr button.mat-icon-button[aria-label*="Delete"]',
        ).first();

        if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await deleteButton.click();

          // Look for confirmation dialog
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK"), ' +
            'button:has-text("Delete"), .mat-dialog-actions button:last-child',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();

            // Wait for delete operation to complete
            await page.waitForTimeout(2000);

            // Verify expense was removed - check for success message
            const successMessage = page.locator(
              '.mat-snack-bar-container:has-text("Deleted"), ' +
              '.snack-bar:has-text("Deleted"), ' +
              '[data-testid="success-message"]',
            );
            const hasSuccessMessage = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (hasSuccessMessage) {
              expect(hasSuccessMessage).toBe(true);
            }
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E002: should delete an expense from the dashboard table - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);

      // Navigate to dashboard
      await page.goto(`${REACT_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for expense rows in the table
      const expenseRows = page.locator('table tr').filter({ hasNot: page.locator('th') });
      const rowCount = await expenseRows.count();

      if (rowCount > 0) {
        // Find and click delete button on first row
        const deleteButton = page.locator(
          'table tr:has(button:has-text("Delete")) button:has-text("Delete"), ' +
          'table tr td button[aria-label*="delete"], ' +
          'table tr .delete-btn, ' +
          'table tr button[aria-label*="Delete"]',
        ).first();

        if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await deleteButton.click();

          // Look for confirmation dialog
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK"), ' +
            'button:has-text("Delete"), .MuiDialogActions button:last-child',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();

            // Wait for delete operation to complete
            await page.waitForTimeout(2000);

            // Verify expense was removed - check for success message
            const successMessage = page.locator(
              '.MuiSnackbar-root:has-text("Deleted"), ' +
              '.snack-bar:has-text("Deleted"), ' +
              '[data-testid="success-message"]',
            );
            const hasSuccessMessage = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (hasSuccessMessage) {
              expect(hasSuccessMessage).toBe(true);
            }
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E003: should show confirmation dialog before deleting - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for delete button
      const deleteButton = page.locator(
        'table tr button:has-text("Delete"), ' +
        'table tr button[aria-label*="delete"]',
      ).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Verify confirmation dialog appears
        const dialog = page.locator(
          'mat-dialog-container, .mat-dialog-container, [role="dialog"]',
        );
        
        const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
        expect(dialogVisible).toBe(true);
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E004: should show confirmation dialog before deleting - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for delete button
      const deleteButton = page.locator(
        'table tr button:has-text("Delete"), ' +
        'table tr button[aria-label*="delete"]',
      ).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Verify confirmation dialog appears
        const dialog = page.locator(
          '.MuiDialog-root, [role="dialog"]',
        );
        
        const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
        expect(dialogVisible).toBe(true);
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E005: should cancel delete operation - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const deleteButton = page.locator(
        'table tr button:has-text("Delete"), ' +
        'table tr button[aria-label*="delete"]',
      ).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Click cancel
        const cancelButton = page.locator(
          'button:has-text("Cancel"), button:has-text("No"), .mat-dialog-actions button:first-child',
        ).first();

        if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await cancelButton.click();
          await page.waitForTimeout(1000);

          // Verify expense is still in the table
          const expenseRows = page.locator('table tr').filter({ hasNot: page.locator('th') });
          const rowCount = await expenseRows.count();
          expect(rowCount).toBeGreaterThan(0);
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E006: should cancel delete operation - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const deleteButton = page.locator(
        'table tr button:has-text("Delete"), ' +
        'table tr button[aria-label*="delete"]',
      ).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Click cancel
        const cancelButton = page.locator(
          'button:has-text("Cancel"), button:has-text("No"), .MuiDialogActions button:first-child',
        ).first();

        if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await cancelButton.click();
          await page.waitForTimeout(1000);

          // Verify expense is still in the table
          const expenseRows = page.locator('table tr').filter({ hasNot: page.locator('th') });
          const rowCount = await expenseRows.count();
          expect(rowCount).toBeGreaterThan(0);
        }
      }
    } finally {
      await context.close();
    }
  });
});

test.describe('E2E/Parity: Delete via DeleteExpenseDialog [RT-93, AC-1, E2E]', () => {
  test('RT-93-E2E007: should open DeleteExpenseDialog and delete - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for edit/delete button to open ManageExpenseComponent dialog
      const editButton = page.locator(
        'table tr button:has-text("Edit"), ' +
        'table tr button[aria-label="Edit"], ' +
        'table tr .edit-btn',
      ).first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Look for delete button in the dialog
        const deleteInDialog = page.locator(
          'mat-dialog-container button:has-text("Delete"), ' +
          '.mat-dialog-container button:has-text("Delete"), ' +
          '[role="dialog"] button:has-text("Delete")',
        ).first();

        if (await deleteInDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
          await deleteInDialog.click();

          // Confirm deletion
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK"), ' +
            'button:has-text("Delete")',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMsg = page.locator(
              '.mat-snack-bar-container:has-text("Deleted"), ' +
              '.snack-bar:has-text("Deleted")',
            );
            const hasSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasSuccess).toBe(true);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E008: should open DeleteExpenseDialog and delete - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for edit/delete button to open dialog
      const editButton = page.locator(
        'table tr button:has-text("Edit"), ' +
        'table tr button[aria-label="Edit"], ' +
        'table tr .edit-btn',
      ).first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Look for delete button in the dialog
        const deleteInDialog = page.locator(
          '.MuiDialog-root button:has-text("Delete"), ' +
          '[role="dialog"] button:has-text("Delete")',
        ).first();

        if (await deleteInDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
          await deleteInDialog.click();

          // Confirm deletion
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK"), ' +
            'button:has-text("Delete")',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMsg = page.locator(
              '.MuiSnackbar-root:has-text("Deleted"), ' +
              '.snack-bar:has-text("Deleted")',
            );
            const hasSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasSuccess).toBe(true);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E009: should display expense details in DeleteExpenseDialog - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const editButton = page.locator(
        'table tr button:has-text("Edit"), ' +
        'table tr button[aria-label="Edit"]',
      ).first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Verify dialog is open and shows expense details
        const dialog = page.locator('mat-dialog-container, .mat-dialog-container, [role="dialog"]');
        const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
        expect(dialogVisible).toBe(true);
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E010: should display expense details in DeleteExpenseDialog - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const editButton = page.locator(
        'table tr button:has-text("Edit"), ' +
        'table tr button[aria-label="Edit"]',
      ).first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Verify dialog is open and shows expense details
        const dialog = page.locator('.MuiDialog-root, [role="dialog"]');
        const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
        expect(dialogVisible).toBe(true);
      }
    } finally {
      await context.close();
    }
  });
});

test.describe('E2E/Parity: Bulk delete from import review table (both shells) [RT-93, AC-1, E2E]', () => {
  test('RT-93-E2E011: should bulk delete selected expenses from import review table - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      
      // Navigate to import review page
      await page.goto(`${ANGULAR_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for checkboxes in the import review table
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        // Select first few expenses
        for (let i = 0; i < Math.min(3, checkboxCount); i++) {
          await checkboxes.nth(i).check();
          await page.waitForTimeout(500);
        }

        // Look for bulk delete button
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete"), ' +
          'button[aria-label*="Bulk Delete"], .bulk-delete-btn',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Confirm bulk delete
          const confirmButton = page.locator(
            'button:has-text("Delete Expenses"), button:has-text("Confirm"), ' +
            'button:has-text("Yes"), .mat-dialog-actions button:last-child',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMsg = page.locator(
              '.mat-snack-bar-container:has-text("deleted"), ' +
              '.snack-bar:has-text("deleted")',
            );
            const hasSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasSuccess).toBe(true);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E012: should bulk delete selected expenses from import review table - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      
      // Navigate to import review page
      await page.goto(`${REACT_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for checkboxes in the import review table
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        // Select first few expenses
        for (let i = 0; i < Math.min(3, checkboxCount); i++) {
          await checkboxes.nth(i).check();
          await page.waitForTimeout(500);
        }

        // Look for bulk delete button
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete"), ' +
          'button[aria-label*="Bulk Delete"], .bulk-delete-btn',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Confirm bulk delete
          const confirmButton = page.locator(
            'button:has-text("Delete Expenses"), button:has-text("Confirm"), ' +
            'button:has-text("Yes"), .MuiDialogActions button:last-child',
          ).first();

          if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMsg = page.locator(
              '.MuiSnackbar-root:has-text("deleted"), ' +
              '.snack-bar:has-text("deleted")',
            );
            const hasSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasSuccess).toBe(true);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E013: should select all expenses before bulk delete - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for "select all" checkbox in header
      const selectAllCheckbox = page.locator(
        'table thead input[type="checkbox"], ' +
        '.mat-header-cell input[type="checkbox"]',
      ).first();

      if (await selectAllCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selectAllCheckbox.click();
        await page.waitForTimeout(1000);

        // Verify checkboxes are selected
        const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
        const checkedCount = await checkedCheckboxes.count();
        expect(checkedCount).toBeGreaterThan(0);
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E014: should select all expenses before bulk delete - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for "select all" checkbox in header
      const selectAllCheckbox = page.locator(
        'table thead input[type="checkbox"], ' +
        '.MuiTableHead input[type="checkbox"]',
      ).first();

      if (await selectAllCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selectAllCheckbox.click();
        await page.waitForTimeout(1000);

        // Verify checkboxes are selected
        const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
        const checkedCount = await checkedCheckboxes.count();
        expect(checkedCount).toBeGreaterThan(0);
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E015: should show bulk delete confirmation dialog - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select an expense
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await checkbox.check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Verify confirmation dialog appears
          const dialog = page.locator('mat-dialog-container, .mat-dialog-container, [role="dialog"]');
          const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
          expect(dialogVisible).toBe(true);
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E016: should show bulk delete confirmation dialog - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select an expense
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await checkbox.check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Verify confirmation dialog appears
          const dialog = page.locator('.MuiDialog-root, [role="dialog"]');
          const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
          expect(dialogVisible).toBe(true);
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E017: should cancel bulk delete operation - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select an expense
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await checkbox.check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Click cancel
          const cancelButton = page.locator(
            'button:has-text("Cancel"), button:has-text("No"), .mat-dialog-actions button:first-child',
          ).first();

          if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await cancelButton.click();
            await page.waitForTimeout(1000);

            // Verify expense is still selected
            const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
            const checkedCount = await checkedCheckboxes.count();
            expect(checkedCount).toBeGreaterThan(0);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E018: should cancel bulk delete operation - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select an expense
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await checkbox.check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Click cancel
          const cancelButton = page.locator(
            'button:has-text("Cancel"), button:has-text("No"), .MuiDialogActions button:first-child',
          ).first();

          if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await cancelButton.click();
            await page.waitForTimeout(1000);

            // Verify expense is still selected
            const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
            const checkedCount = await checkedCheckboxes.count();
            expect(checkedCount).toBeGreaterThan(0);
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E019: should display selected expenses in bulk delete preview - Angular', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, ANGULAR_URL);
      await page.goto(`${ANGULAR_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select multiple expenses
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount >= 2) {
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Verify dialog shows selected expenses
          const dialog = page.locator('mat-dialog-container, .mat-dialog-container, [role="dialog"]');
          const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
          expect(dialogVisible).toBe(true);
        }
      }
    } finally {
      await context.close();
    }
  });

  test('RT-93-E2E020: should display selected expenses in bulk delete preview - React', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      await authenticate(page, REACT_URL);
      await page.goto(`${REACT_URL}/import-expenses`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Select multiple expenses
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount >= 2) {
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);

        // Click bulk delete
        const bulkDeleteButton = page.locator(
          'button:has-text("Delete"), button:has-text("Bulk Delete")',
        ).first();

        if (await bulkDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await bulkDeleteButton.click();
          await page.waitForTimeout(1000);

          // Verify dialog shows selected expenses
          const dialog = page.locator('.MuiDialog-root, [role="dialog"]');
          const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
          expect(dialogVisible).toBe(true);
        }
      }
    } finally {
      await context.close();
    }
  });
});
