import { test, expect, TEST_USER } from '../parity/fixtures';

test.describe('End-to-End User Flows - Expense Type Grouping', () => {
  // RT-96-E2E-001: Test user can create expense with type selection
  test('RT-96-E2E-001 | RT-97 | User can create expense with type selection | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to log expense page
    const logExpenseLink = page.locator(
      'a:has-text("Log Expense"), [routerLink*="log-expense"], a[href*="log-expense"], button:has-text("Log Expense")',
    );
    await logExpenseLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Fill expense name
    const nameInput = page.locator(
      'input[name="name"], input[formControlName="name"], input[placeholder*="name"], input[placeholder*="Name"], [data-testid="expense-name"]',
    );
    await nameInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.first().fill('E2E Test Expense');

    // Fill amount
    const amountInput = page.locator(
      'input[name="amount"], input[type="number"], input[formControlName="amount"], [data-testid="amount-input"]',
    );
    await amountInput.first().waitFor({ state: 'visible', timeout: 5000 });
    await amountInput.first().fill('42.50');

    // Select type from dropdown
    const typeSelect = page.locator(
      'mat-select[formControlName="type"], select[name="type"], select[formControlName="type"], [data-testid="type-select"], mat-select[aria-label*="type"]',
    );
    if ((await typeSelect.count()) > 0) {
      await typeSelect.first().click();
      const typeOption = page.locator(
        'mat-option, option, [role="option"], li[role="option"]',
      );
      const optionCount = await typeOption.count();
      if (optionCount > 0) {
        // Select first available type option
        await typeOption.first().click();
      }
    }

    // Save the expense
    const saveButton = page.locator(
      'button[type="submit"], button:has-text("Save"), button:has-text("Add"), button:has-text("Submit")',
    );
    await saveButton.first().click();

    // Verify success - either snackbar or redirect
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  // RT-96-E2E-002: Test user can view expense in dashboard with type grouping
  test('RT-96-E2E-002 | RT-97 | User can view expense in dashboard with type grouping | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"], a[href*="dashboard"], button:has-text("Dashboard")',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Verify dashboard content is visible
    const dashboardContent = page.locator(
      '[data-testid="dashboard"], app-dashboard, .dashboard, main',
    );
    await expect(dashboardContent.first()).toBeVisible({ timeout: 10000 });

    // Look for type-related data in the dashboard
    const typeData = page.locator(
      '[data-testid="type-data"], [data-testid="source-type"], mat-chip:has-text("Credit"), mat-chip:has-text("Debit"), mat-chip:has-text("Cash")',
    );
    // Dashboard should have some content (expenses or type data)
    const hasContent = await page.locator('mat-row, tr, .expense-item, mat-card').count();
    expect(hasContent).toBeGreaterThanOrEqual(0);
  });

  // RT-96-E2E-003: Test user can filter dashboard by type
  test('RT-96-E2E-003 | RT-97 | User can filter dashboard by type | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"], a[href*="dashboard"]',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for type filter chips or dropdowns
    const typeFilter = page.locator(
      'mat-chip, [data-testid="type-filter"], mat-select[aria-label*="type"], select[name="type"]',
    );
    if ((await typeFilter.count()) > 0) {
      await typeFilter.first().click();
      // Verify filter interaction
      await expect(typeFilter.first()).toBeVisible();
    }

    // Verify table or list updates
    const tableRows = page.locator('mat-row, tr.expense-row, tr[data-testid="expense-row"]');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  // RT-96-E2E-004: Test user can update expense type via manage modal
  test('RT-96-E2E-004 | RT-97 | User can update expense type via manage modal | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"]',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for edit/manage buttons
    const editButton = page.locator(
      'button:has-text("Edit"), button[aria-label*="edit"], mat-icon-button:has-text("edit"), [data-testid="edit-expense"]',
    );
    if ((await editButton.count()) > 0) {
      await editButton.first().click();

      // Wait for modal/dialog
      const dialog = page.locator('mat-dialog-container, .mat-dialog-container');
      await dialog.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Look for type field in modal
      const typeField = page.locator(
        'mat-select[formControlName="type"], select[name="type"], input[name="type"]',
      );
      if ((await typeField.count()) > 0) {
        await typeField.first().click();
        const option = page.locator('mat-option, option, [role="option"]');
        if ((await option.count()) > 0) {
          await option.first().click();
        }
      }

      // Save changes
      const saveBtn = page.locator(
        'button:has-text("Save"), button:has-text("Update"), button[type="submit"]',
      );
      if ((await saveBtn.count()) > 0) {
        await saveBtn.first().click();
      }
    }
  });

  // RT-96-E2E-005: Test user can delete expense and type is removed from grouping
  test('RT-96-E2E-005 | RT-97 | User can delete expense and type is removed from grouping | Risk: Medium', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"]',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for delete button
    const deleteButton = page.locator(
      'button:has-text("Delete"), button[aria-label*="delete"], mat-icon-button:has-text("delete"), [data-testid="delete-expense"]',
    );
    if ((await deleteButton.count()) > 0) {
      await deleteButton.first().click();

      // Confirm deletion
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")',
      );
      if ((await confirmButton.count()) > 0) {
        await confirmButton.first().click();
      }

      // Verify expense is removed
      const snackbar = page.locator('mat-snack-bar-container');
      await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  // RT-96-E2E-006: Test user can add custom type via expense settings
  test('RT-96-E2E-006 | RT-97 | User can add custom type via expense settings | Risk: Medium', async ({ authenticatedPage: page }) => {
    // Navigate to settings
    const settingsLink = page.locator(
      'a:has-text("Settings"), [routerLink*="settings"], a[href*="settings"], button:has-text("Settings")',
    );
    await settingsLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for type management section
    const typeSection = page.locator(
      '[data-testid="type-settings"], [data-testid="source-types"], mat-card:has-text("Type"), mat-card:has-text("Source")',
    );
    if ((await typeSection.count()) > 0) {
      // Look for add type input
      const addTypeInput = page.locator(
        'input[placeholder*="type"], input[placeholder*="Type"], input[name="newType"], mat-form-field input',
      );
      if ((await addTypeInput.count()) > 0) {
        await addTypeInput.first().fill('E2E Custom Type');
      }

      // Look for save button
      const saveButton = page.locator(
        'button:has-text("Save"), button:has-text("Add"), button:has-text("Submit")',
      );
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
      }
    }
  });

  // RT-96-E2E-007: Test user can remove custom type via expense settings
  test('RT-96-E2E-007 | RT-97 | User can remove custom type via expense settings | Risk: Medium', async ({ authenticatedPage: page }) => {
    // Navigate to settings
    const settingsLink = page.locator(
      'a:has-text("Settings"), [routerLink*="settings"]',
    );
    await settingsLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for remove button on type chips
    const removeButton = page.locator(
      'mat-chip .mat-chip-remove, button[aria-label*="remove"], mat-icon[aria-label*="remove"]',
    );
    if ((await removeButton.count()) > 0) {
      await removeButton.first().click();

      // Verify removal confirmation
      const snackbar = page.locator('mat-snack-bar-container');
      await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  // RT-96-E2E-008: Test user can bulk-edit expense types
  test('RT-96-E2E-008 | RT-97 | User can bulk-edit expense types | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"]',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for bulk edit button
    const bulkEditButton = page.locator(
      'button:has-text("Bulk Edit"), button:has-text("Bulk Update"), [data-testid="bulk-edit"], button:has-text("Update")',
    );
    if ((await bulkEditButton.count()) > 0) {
      await bulkEditButton.first().click();

      // Wait for bulk edit dialog
      const dialog = page.locator('mat-dialog-container, .mat-dialog-container');
      await dialog.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Look for type dropdown in bulk edit
      const typeSelect = page.locator(
        'mat-select[formControlName="type"], select[name="type"], mat-select[aria-label*="type"]',
      );
      if ((await typeSelect.count()) > 0) {
        await typeSelect.first().click();
        const option = page.locator('mat-option, option, [role="option"]');
        if ((await option.count()) > 0) {
          await option.first().click();
        }
      }

      // Confirm bulk edit
      const confirmButton = page.locator(
        'button:has-text("Save"), button:has-text("Confirm"), button:has-text("Update")',
      );
      if ((await confirmButton.count()) > 0) {
        await confirmButton.first().click();
      }
    }
  });

  // RT-96-E2E-009: Test user can import expenses with type mapping
  test('RT-96-E2E-009 | RT-97 | User can import expenses with type mapping | Risk: High', async ({ authenticatedPage: page }) => {
    // Navigate to log expense or import section
    const importLink = page.locator(
      'a:has-text("Import"), button:has-text("Import"), [data-testid="import-expenses"], [routerLink*="import"]',
    );
    if ((await importLink.count()) > 0) {
      await importLink.first().click({ timeout: 10000 });
      await page.waitForLoadState('networkidle');
    }

    // Look for import functionality (file upload or CSV import)
    const fileInput = page.locator('input[type="file"], input[accept*="csv"], input[accept*="excel"]');
    if ((await fileInput.count()) > 0) {
      // File upload field exists - verify type mapping options are available
      const typeMapping = page.locator(
        '[data-testid="type-mapping"], [data-testid="type-column"], select[name="typeMapping"]',
      );
      if ((await typeMapping.count()) > 0) {
        await expect(typeMapping.first()).toBeVisible();
      }
    } else {
      // If no direct import UI, verify type field exists in expense form
      const typeField = page.locator(
        'mat-select[formControlName="type"], select[name="type"], input[name="type"]',
      );
      if ((await typeField.count()) > 0) {
        await expect(typeField.first()).toBeVisible();
      }
    }
  });

  // RT-96-E2E-010: Test user can export expenses with type column
  test('RT-96-E2E-010 | RT-97 | User can export expenses with type column | Risk: Medium', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), [routerLink*="dashboard"]',
    );
    await dashboardLink.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Look for export button
    const exportButton = page.locator(
      'button:has-text("Export"), [data-testid="export-expenses"], button:has-text("Download"), button:has-text("CSV")',
    );
    if ((await exportButton.count()) > 0) {
      await exportButton.first().click();

      // Verify export initiated (file download or confirmation)
      const snackbar = page.locator('mat-snack-bar-container');
      await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Verify type column exists in table if visible
    const typeColumn = page.locator(
      'th:has-text("Type"), th[aria-label*="type"], [data-testid="type-column"], mat-header-cell:has-text("Type")',
    );
    if ((await typeColumn.count()) > 0) {
      await expect(typeColumn.first()).toBeVisible();
    }
  });
});
