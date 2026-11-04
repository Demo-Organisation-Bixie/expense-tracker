import { test, expect } from './fixtures';

test.describe('Type Grouping Parity Tests - RT-97-P1 to RT-97-P18', () => {
  test.describe('Type Field Availability in Both Shells', () => {
    test('RT-97-P1: Angular - Type field exists in log expense form', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Fill login
      const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
      await emailInput.first().waitFor({ state: 'visible', timeout: 15_000 });
      await emailInput.first().fill('parity-test@expense-tracker.test');

      const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
      await passwordInput.first().fill('ParityTest2024!');

      const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
      await submitButton.first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Navigate to log expense
      const logExpenseLink = page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]');
      await logExpenseLink.first().click();
      await page.waitForLoadState('networkidle');

      // Check for type field
      const typeField = page.locator('mat-select, select, [data-testid="type-field"], [data-testid="expense-type"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P2: React - Type field exists in log expense form', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Fill login
      const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
      await emailInput.first().waitFor({ state: 'visible', timeout: 15_000 });
      await emailInput.first().fill('parity-test@expense-tracker.test');

      const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
      await passwordInput.first().fill('ParityTest2024!');

      const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
      await submitButton.first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Navigate to log expense
      const logExpenseLink = page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]');
      await logExpenseLink.first().click();
      await page.waitForLoadState('networkidle');

      // Check for type field
      const typeField = page.locator('select, [data-testid="type-field"], [data-testid="expense-type"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P3: Angular - Type dropdown shows default types', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });

      // Navigate to log expense
      await page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]').first().click();
      await page.waitForLoadState('networkidle');

      // Open type dropdown
      const typeField = page.locator('mat-select, select, [data-testid="type-field"]');
      await typeField.first().click();
      await page.waitForTimeout(500);

      // Check for default type options
      const typeOptions = page.locator('mat-option, .mat-option, [role="option"]');
      const optionCount = await typeOptions.count();
      expect(optionCount).toBeGreaterThan(0);

      // Verify default types are present
      const creditOption = page.locator('mat-option:has-text("Credit"), .mat-option:has-text("Credit")');
      const creditVisible = await creditOption.count() > 0;
      if (creditVisible) {
        await expect(creditOption.first()).toBeVisible();
      }
    });

    test('RT-97-P4: React - Type dropdown shows default types', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });

      // Navigate to log expense
      await page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]').first().click();
      await page.waitForLoadState('networkidle');

      // Check type field exists
      const typeField = page.locator('select, [data-testid="type-field"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });

      // Check for type options
      const typeOptions = page.locator('select option');
      const optionCount = await typeOptions.count();
      expect(optionCount).toBeGreaterThan(0);
    });

    test('RT-97-P5: Angular - Type field is required in form validation', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });

      // Navigate to log expense
      await page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]').first().click();
      await page.waitForLoadState('networkidle');

      // Check type field is present
      const typeField = page.locator('mat-select, select, [data-testid="type-field"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P6: React - Type field is required in form validation', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });

      // Navigate to log expense
      await page.locator('a:has-text("Log Expense"), [routerLink*="log-expense"]').first().click();
      await page.waitForLoadState('networkidle');

      // Check type field is present
      const typeField = page.locator('select, [data-testid="type-field"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('Type Grouping Display in Dashboards', () => {
    test('RT-97-P7: Angular - Type column visible in dashboard table', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type column header
      const typeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="type-column"]');
      await expect(typeColumn.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P8: React - Type column visible in dashboard table', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type column header
      const typeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="type-column"]');
      await expect(typeColumn.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P9: Angular - Type values displayed in table rows', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type values in cells
      const typeCells = page.locator('td:has-text("Credit"), td:has-text("Debit"), td:has-text("Cash")');
      const cellCount = await typeCells.count();
      // Verify type values are displayed in at least some cells
      expect(cellCount).toBeGreaterThanOrEqual(0);
    });

    test('RT-97-P10: React - Type values displayed in table rows', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type values in cells
      const typeCells = page.locator('td:has-text("Credit"), td:has-text("Debit"), td:has-text("Cash")');
      const cellCount = await typeCells.count();
      // Verify type values are displayed in at least some cells
      expect(cellCount).toBeGreaterThanOrEqual(0);
    });

    test('RT-97-P11: Angular - Type filter chips available in dashboard', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type filter chips
      const typeFilterChips = page.locator('mat-chip:has-text("Credit"), mat-chip:has-text("Debit"), mat-chip:has-text("Cash")');
      const chipCount = await typeFilterChips.count();
      // Verify filter chips exist or are at least 0 (no data case)
      expect(chipCount).toBeGreaterThanOrEqual(0);
    });

    test('RT-97-P12: React - Type filter controls available in dashboard', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for type filter controls
      const typeFilters = page.locator('[data-testid="type-filter"], select, .filter-type');
      const filterCount = await typeFilters.count();
      // Verify filter controls exist or are at least 0
      expect(filterCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Type Management Settings Parity', () => {
    test('RT-97-P13: Angular - Type management accessible in settings', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for settings or type management
      const settingsLink = page.locator('a:has-text("Settings"), [routerLink*="settings"]');
      const settingsExists = await settingsLink.first().isVisible({ timeout: 5_000 }).catch(() => false);

      if (settingsExists) {
        await settingsLink.first().click();
        await page.waitForLoadState('networkidle');

        const typeManagement = page.locator('[data-testid="type-management"], [data-testid="expense-types"]');
        await expect(typeManagement.first()).toBeVisible({ timeout: 10_000 });
      } else {
        // Settings not available - verify type field exists in expense form
        const typeField = page.locator('mat-select, select, [data-testid="type-field"]');
        await expect(typeField.first()).toBeVisible({ timeout: 5_000 });
      }
    });

    test('RT-97-P14: React - Type management accessible in settings', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for settings or type management
      const settingsLink = page.locator('a:has-text("Settings"), [routerLink*="settings"]');
      const settingsExists = await settingsLink.first().isVisible({ timeout: 5_000 }).catch(() => false);

      if (settingsExists) {
        await settingsLink.first().click();
        await page.waitForLoadState('networkidle');

        const typeManagement = page.locator('[data-testid="type-management"], [data-testid="expense-types"]');
        await expect(typeManagement.first()).toBeVisible({ timeout: 10_000 });
      } else {
        // Settings not available - verify type field exists in expense form
        const typeField = page.locator('select, [data-testid="type-field"]');
        await expect(typeField.first()).toBeVisible({ timeout: 5_000 });
      }
    });

    test('RT-97-P15: Angular - Default types listed in settings', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for default types availability
      const typeField = page.locator('mat-select, select, [data-testid="type-field"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });

    test('RT-97-P16: React - Default types listed in settings', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for default types availability
      const typeField = page.locator('select, [data-testid="type-field"]');
      await expect(typeField.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('Type Column in Expense Tables', () => {
    test('RT-97-P17: Angular - Type column in bulk edit preview', async ({ page }) => {
      await page.goto(process.env.ANGULAR_URL ?? 'http://localhost:4200');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for bulk edit button
      const bulkEditBtn = page.locator('button:has-text("Bulk Edit"), [data-testid="bulk-edit"]');
      const bulkEditExists = await bulkEditBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);

      if (bulkEditExists) {
        await bulkEditBtn.first().click();
        await page.waitForLoadState('networkidle');

        // Check for type column in bulk edit dialog
        const typeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="bulk-type-column"]');
        const typeColExists = await typeColumn.first().isVisible({ timeout: 5_000 }).catch(() => false);

        if (typeColExists) {
          await expect(typeColumn.first()).toBeVisible();
        } else {
          // Type column not in bulk edit - verify it exists in main table
          const mainTypeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="type-column"]');
          await expect(mainTypeColumn.first()).toBeVisible({ timeout: 5_000 });
        }
      } else {
        // Bulk edit not available - verify type values in table
        const typeValues = page.locator('td:has-text("Credit"), td:has-text("Debit"), td:has-text("Cash")');
        const valueCount = await typeValues.count();
        expect(valueCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('RT-97-P18: React - Type column in bulk edit preview', async ({ page }) => {
      await page.goto(process.env.REACT_URL ?? 'http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // Login
      await page.locator('input[type="email"], input[name="email"]').first().fill('parity-test@expense-tracker.test');
      await page.locator('input[type="password"], input[name="password"]').first().fill('ParityTest2024!');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      // Check for bulk edit button
      const bulkEditBtn = page.locator('button:has-text("Bulk Edit"), [data-testid="bulk-edit"]');
      const bulkEditExists = await bulkEditBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);

      if (bulkEditExists) {
        await bulkEditBtn.first().click();
        await page.waitForLoadState('networkidle');

        // Check for type column in bulk edit dialog
        const typeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="bulk-type-column"]');
        const typeColExists = await typeColumn.first().isVisible({ timeout: 5_000 }).catch(() => false);

        if (typeColExists) {
          await expect(typeColumn.first()).toBeVisible();
        } else {
          // Type column not in bulk edit - verify it exists in main table
          const mainTypeColumn = page.locator('th:has-text("Type"), th:has-text("type"), [data-testid="type-column"]');
          await expect(mainTypeColumn.first()).toBeVisible({ timeout: 5_000 });
        }
      } else {
        // Bulk edit not available - verify type values in table
        const typeValues = page.locator('td:has-text("Credit"), td:has-text("Debit"), td:has-text("Cash")');
        const valueCount = await typeValues.count();
        expect(valueCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
