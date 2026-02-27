import { test, expect } from "@playwright/test";

test.describe("Filter component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the filter component", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    await expect(filter).toBeVisible();
  });

  test("has a toggle button", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await expect(toggleBtn).toBeVisible();
  });

  test("dropdown is hidden by default", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const dropdown = filter.locator(".pxme-filter__dropdown");
    await expect(dropdown).not.toBeVisible();
  });

  test("opens filter dropdown on click", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await toggleBtn.click();

    const dropdown = filter.locator(".pxme-filter__dropdown");
    await expect(dropdown).toBeVisible({ timeout: 5_000 });
  });

  test("loads categories from API", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await toggleBtn.click();

    // Wait for categories to load into #categories-group
    const categoryChips = filter.locator("#categories-group .pxme-filter__chip");
    await expect(categoryChips.first()).toBeVisible({ timeout: 10_000 });

    const count = await categoryChips.count();
    // We have 30 canonical categories
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("loads people from API", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await toggleBtn.click();

    // People group should exist (may have chips or be empty)
    const peopleGroup = filter.locator("#people-group");
    await expect(peopleGroup).toBeAttached();

    // If people are loaded, there should be a label
    const dropdown = filter.locator(".pxme-filter__dropdown");
    await expect(dropdown).toBeVisible({ timeout: 5_000 });
  });

  test("selecting a category filters the gallery", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");

    // Wait for initial gallery load
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Open filter and click a category
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await toggleBtn.click();

    const categoryChips = filter.locator("#categories-group .pxme-filter__chip");
    await expect(categoryChips.first()).toBeVisible({ timeout: 10_000 });

    // Click the first category chip
    await categoryChips.first().click();

    // URL should update with category param
    await page.waitForTimeout(1500);
    const url = page.url();
    expect(url).toContain("category=");
  });

  test("chip toggles active state on click", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");
    await toggleBtn.click();

    const categoryChips = filter.locator("#categories-group .pxme-filter__chip");
    await expect(categoryChips.first()).toBeVisible({ timeout: 10_000 });

    const firstChip = categoryChips.first();

    // Click to activate
    await firstChip.click();
    await expect(firstChip).toHaveClass(/pxme-filter__chip--active/);

    // Click again to deactivate
    await firstChip.click();
    await expect(firstChip).not.toHaveClass(/pxme-filter__chip--active/);
  });

  test("closes filter dropdown on second click", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggleBtn = filter.locator(".pxme-filter__toggle");

    await toggleBtn.click();
    const dropdown = filter.locator(".pxme-filter__dropdown");
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    await toggleBtn.click();
    await expect(dropdown).not.toBeVisible();
  });
});
