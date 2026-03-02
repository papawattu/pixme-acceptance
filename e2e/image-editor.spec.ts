import { test, expect } from "@playwright/test";

const adminSession = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    image: "https://example.com/avatar.png",
    role: "admin",
  },
  expires: "2099-12-31T23:59:59.000Z",
};

const regularSession = {
  user: {
    name: "Regular User",
    email: "user@example.com",
    image: "https://example.com/avatar.png",
  },
  expires: "2099-12-31T23:59:59.000Z",
};

test.describe("Image editor — unauthenticated", () => {
  test("edit icons are not shown on gallery cards", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const editBtns = gallery.locator(".pxme-edit-btn");
    await expect(editBtns).toHaveCount(0);
  });
});

test.describe("Image editor — non-admin user", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(regularSession),
      }),
    );
  });

  test("edit icons are not shown for non-admin users", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const editBtns = gallery.locator(".pxme-edit-btn");
    await expect(editBtns).toHaveCount(0);
  });
});

test.describe("Image editor — admin user", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(adminSession),
      }),
    );
  });

  test("shows edit icon on every gallery card", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    const cards = gallery.locator(".pxme-gallery__link");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const cardCount = await cards.count();
    const editBtns = gallery.locator(".pxme-edit-btn");
    await expect(editBtns).toHaveCount(cardCount);
  });

  test("opens editor when edit icon is clicked", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });
  });

  test("does not navigate when edit icon is clicked", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const urlBefore = page.url();
    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    // Should stay on the same page
    expect(page.url()).toBe(urlBefore);
  });

  test("displays current categories in editor", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const categoriesSection = editor.locator(".pxme-editor__categories");
    await expect(categoriesSection).toBeVisible();
  });

  test("displays current people in editor", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const peopleSection = editor.locator(".pxme-editor__people");
    await expect(peopleSection).toBeVisible();
  });

  test("has input fields for adding categories and people", async ({
    page,
  }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await expect(categoryInput).toBeVisible();

    const peopleInput = editor.locator(
      ".pxme-editor__people .pxme-editor__input",
    );
    await expect(peopleInput).toBeVisible();
  });

  test("closes editor when close button is clicked", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const closeBtn = editor.locator(".pxme-editor__close");
    await closeBtn.click();

    await expect(editor).not.toBeVisible();
  });

  test("closes editor when overlay backdrop is clicked", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const overlay = editor.locator(".pxme-editor__overlay");
    // Click the overlay at its edge (outside the dialog content)
    await overlay.click({ position: { x: 5, y: 5 } });

    await expect(editor).not.toBeVisible();
  });

  test("adds a category via POST request", async ({ page }) => {
    const apiRequests: { method: string; url: string }[] = [];

    await page.route("**/api/images/*/categories/*", (route) => {
      apiRequests.push({
        method: route.request().method(),
        url: route.request().url(),
      });
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.fill("TestCategory");

    const addBtn = editor.locator(
      ".pxme-editor__categories .pxme-editor__add-btn",
    );
    await addBtn.click();

    // New tag should appear in the editor (wait for async request to complete)
    const tags = editor.locator(".pxme-editor__categories .pxme-editor__tag");
    await expect(tags.filter({ hasText: "TestCategory" })).toBeVisible({
      timeout: 5_000,
    });

    // Verify a POST was sent to the categories endpoint
    expect(apiRequests.length).toBeGreaterThanOrEqual(1);
    const postReq = apiRequests.find((r) => r.method === "POST");
    expect(postReq).toBeTruthy();
    expect(postReq!.url).toContain("/categories/TestCategory");
  });

  test("removes a category via DELETE request", async ({ page }) => {
    const apiRequests: { method: string; url: string }[] = [];

    await page.route("**/api/images/*/categories/*", (route) => {
      apiRequests.push({
        method: route.request().method(),
        url: route.request().url(),
      });
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Find a card that has categories in its caption
    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const categoryTags = editor.locator(
      ".pxme-editor__categories .pxme-editor__tag",
    );
    const tagCount = await categoryTags.count();

    // Skip if no categories to remove
    if (tagCount === 0) return;

    const removeBtn = editor
      .locator(".pxme-editor__categories .pxme-editor__tag-remove")
      .first();
    await removeBtn.click();

    // Verify a DELETE was sent
    expect(apiRequests.length).toBeGreaterThanOrEqual(1);
    const deleteReq = apiRequests.find((r) => r.method === "DELETE");
    expect(deleteReq).toBeTruthy();
    expect(deleteReq!.url).toContain("/categories/");

    // Tag count should decrease
    const newTagCount = await categoryTags.count();
    expect(newTagCount).toBeLessThan(tagCount);
  });

  test("adds a person via POST request", async ({ page }) => {
    const apiRequests: { method: string; url: string }[] = [];

    await page.route("**/api/images/*/people/*", (route) => {
      apiRequests.push({
        method: route.request().method(),
        url: route.request().url(),
      });
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const peopleInput = editor.locator(
      ".pxme-editor__people .pxme-editor__input",
    );
    await peopleInput.fill("TestPerson");

    const addBtn = editor.locator(
      ".pxme-editor__people .pxme-editor__add-btn",
    );
    await addBtn.click();

    // New tag should appear in the editor (wait for async request to complete)
    const tags = editor.locator(".pxme-editor__people .pxme-editor__tag");
    await expect(tags.filter({ hasText: "TestPerson" })).toBeVisible({
      timeout: 5_000,
    });

    // Verify a POST was sent to the people endpoint
    expect(apiRequests.length).toBeGreaterThanOrEqual(1);
    const postReq = apiRequests.find((r) => r.method === "POST");
    expect(postReq).toBeTruthy();
    expect(postReq!.url).toContain("/people/TestPerson");
  });

  test("removes a person via DELETE request", async ({ page }) => {
    const apiRequests: { method: string; url: string }[] = [];

    await page.route("**/api/images/*/people/*", (route) => {
      apiRequests.push({
        method: route.request().method(),
        url: route.request().url(),
      });
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    const peopleTags = editor.locator(
      ".pxme-editor__people .pxme-editor__tag",
    );
    const tagCount = await peopleTags.count();

    // Skip if no people to remove
    if (tagCount === 0) return;

    const removeBtn = editor
      .locator(".pxme-editor__people .pxme-editor__tag-remove")
      .first();
    await removeBtn.click();

    // Verify a DELETE was sent
    expect(apiRequests.length).toBeGreaterThanOrEqual(1);
    const deleteReq = apiRequests.find((r) => r.method === "DELETE");
    expect(deleteReq).toBeTruthy();
    expect(deleteReq!.url).toContain("/people/");

    // Tag count should decrease
    const newTagCount = await peopleTags.count();
    expect(newTagCount).toBeLessThan(tagCount);
  });

  test("gallery refreshes after editor is closed with changes", async ({
    page,
  }) => {
    let galleryFetchCount = 0;

    // Track gallery image fetches (the main listing endpoint)
    await page.route("**/api/images/?**", (route) => {
      galleryFetchCount++;
      route.continue();
    });
    // Also track fetches without query params
    await page.route("**/api/images/", (route) => {
      galleryFetchCount++;
      route.continue();
    });

    // Mock category add to succeed
    await page.route("**/api/images/*/categories/*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Record fetch count after initial load
    const initialFetchCount = galleryFetchCount;

    // Open editor
    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    // Add a category to make the editor dirty
    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.fill("RefreshTest");

    const addBtn = editor.locator(
      ".pxme-editor__categories .pxme-editor__add-btn",
    );
    await addBtn.click();

    // Wait for the tag to appear (confirms add succeeded)
    const tags = editor.locator(".pxme-editor__categories .pxme-editor__tag");
    await expect(tags.filter({ hasText: "RefreshTest" })).toBeVisible({
      timeout: 5_000,
    });

    // Close editor
    const closeBtn = editor.locator(".pxme-editor__close");
    await closeBtn.click();
    await expect(editor).not.toBeVisible();

    // Wait for gallery to re-fetch images
    await page.waitForTimeout(1_000);

    // Gallery should have fetched images again after closing the dirty editor
    expect(galleryFetchCount).toBeGreaterThan(initialFetchCount);
  });

  test("gallery does not refresh when editor closed without changes", async ({
    page,
  }) => {
    let galleryFetchCount = 0;

    await page.route("**/api/images/?**", (route) => {
      galleryFetchCount++;
      route.continue();
    });
    await page.route("**/api/images/", (route) => {
      galleryFetchCount++;
      route.continue();
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialFetchCount = galleryFetchCount;

    // Open editor
    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    // Close without making changes
    const closeBtn = editor.locator(".pxme-editor__close");
    await closeBtn.click();
    await expect(editor).not.toBeVisible();

    await page.waitForTimeout(1_000);

    // Gallery should NOT have re-fetched
    expect(galleryFetchCount).toBe(initialFetchCount);
  });
});
