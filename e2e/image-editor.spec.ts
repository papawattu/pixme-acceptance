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

  test("shows save and cancel buttons in editor", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    await expect(editor.locator(".pxme-editor__save-btn")).toBeVisible();
    await expect(editor.locator(".pxme-editor__cancel-btn")).toBeVisible();
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

  test("adds a category tag without sending API request", async ({ page }) => {
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

    // New tag should appear in the editor
    const tags = editor.locator(".pxme-editor__categories .pxme-editor__tag");
    await expect(tags.filter({ hasText: "TestCategory" })).toBeVisible({
      timeout: 5_000,
    });

    // No API request should have been sent yet (changes are local until Save)
    expect(apiRequests.length).toBe(0);
  });

  test("removes a category tag without sending API request", async ({
    page,
  }) => {
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

    // Tag count should decrease
    const newTagCount = await categoryTags.count();
    expect(newTagCount).toBeLessThan(tagCount);

    // No API request should have been sent yet
    expect(apiRequests.length).toBe(0);
  });

  test("adds a person tag without sending API request", async ({ page }) => {
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

    // New tag should appear in the editor
    const tags = editor.locator(".pxme-editor__people .pxme-editor__tag");
    await expect(tags.filter({ hasText: "TestPerson" })).toBeVisible({
      timeout: 5_000,
    });

    // No API request should have been sent yet
    expect(apiRequests.length).toBe(0);
  });

  test("removes a person tag without sending API request", async ({
    page,
  }) => {
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

    // Tag count should decrease
    const newTagCount = await peopleTags.count();
    expect(newTagCount).toBeLessThan(tagCount);

    // No API request should have been sent yet
    expect(apiRequests.length).toBe(0);
  });

  test("save button sends pending add requests to API", async ({ page }) => {
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

    // Add a category
    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.fill("SaveTestCat");
    const catAddBtn = editor.locator(
      ".pxme-editor__categories .pxme-editor__add-btn",
    );
    await catAddBtn.click();
    await expect(
      editor
        .locator(".pxme-editor__categories .pxme-editor__tag")
        .filter({ hasText: "SaveTestCat" }),
    ).toBeVisible({ timeout: 5_000 });

    // Add a person
    const peopleInput = editor.locator(
      ".pxme-editor__people .pxme-editor__input",
    );
    await peopleInput.fill("SaveTestPerson");
    const pplAddBtn = editor.locator(
      ".pxme-editor__people .pxme-editor__add-btn",
    );
    await pplAddBtn.click();
    await expect(
      editor
        .locator(".pxme-editor__people .pxme-editor__tag")
        .filter({ hasText: "SaveTestPerson" }),
    ).toBeVisible({ timeout: 5_000 });

    // No API calls yet
    expect(apiRequests.length).toBe(0);

    // Click Save
    const saveBtn = editor.locator(".pxme-editor__save-btn");
    await saveBtn.click();

    // Editor should close
    await expect(editor).not.toBeVisible({ timeout: 5_000 });

    // API requests should have been sent
    const catPost = apiRequests.find(
      (r) => r.method === "POST" && r.url.includes("/categories/SaveTestCat"),
    );
    expect(catPost).toBeTruthy();

    const pplPost = apiRequests.find(
      (r) => r.method === "POST" && r.url.includes("/people/SaveTestPerson"),
    );
    expect(pplPost).toBeTruthy();
  });

  test("cancel button closes editor without sending API requests", async ({
    page,
  }) => {
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

    // Add a category (local only)
    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.fill("CancelTestCat");
    const addBtn = editor.locator(
      ".pxme-editor__categories .pxme-editor__add-btn",
    );
    await addBtn.click();
    await expect(
      editor
        .locator(".pxme-editor__categories .pxme-editor__tag")
        .filter({ hasText: "CancelTestCat" }),
    ).toBeVisible({ timeout: 5_000 });

    // Click Cancel
    const cancelBtn = editor.locator(".pxme-editor__cancel-btn");
    await cancelBtn.click();

    // Editor should close
    await expect(editor).not.toBeVisible();

    // No API requests should have been sent
    expect(apiRequests.length).toBe(0);
  });

  test("shows category autocomplete suggestions when typing", async ({
    page,
  }) => {
    // Mock both endpoints since _fetchSuggestions uses Promise.all —
    // _allCategories isn't set until both /api/categories/ and /api/people/ resolve
    await page.route("**/api/categories/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: ["Nature", "Landscape", "City", "Architecture"],
        }),
      }),
    );
    await page.route("**/api/people/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ people: [] }),
      }),
    );

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    // Wait for both fetches to complete since _fetchSuggestions uses Promise.all
    const catResponsePromise = page.waitForResponse("**/api/categories/");
    const pplResponsePromise = page.waitForResponse("**/api/people/");
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });
    await catResponsePromise;
    await pplResponsePromise;

    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.click();
    await categoryInput.pressSequentially("nat");

    const suggestions = editor.locator(
      ".pxme-editor__categories .pxme-editor__suggestion",
    );
    await expect(suggestions.filter({ hasText: "Nature" })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("shows people autocomplete suggestions when typing", async ({
    page,
  }) => {
    // Mock both endpoints since _fetchSuggestions uses Promise.all —
    // _allPeople isn't set until both /api/categories/ and /api/people/ resolve
    await page.route("**/api/categories/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ categories: [] }),
      }),
    );
    await page.route("**/api/people/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          people: [
            { id: "1", name: "Alice Johnson" },
            { id: "2", name: "Bob Smith" },
          ],
        }),
      }),
    );

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    // Wait for both fetches to complete since _fetchSuggestions uses Promise.all
    const catResponsePromise = page.waitForResponse("**/api/categories/");
    const pplResponsePromise = page.waitForResponse("**/api/people/");
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });
    await catResponsePromise;
    await pplResponsePromise;

    const peopleInput = editor.locator(
      ".pxme-editor__people .pxme-editor__input",
    );
    await peopleInput.click();
    await peopleInput.pressSequentially("ali");

    const suggestions = editor.locator(
      ".pxme-editor__people .pxme-editor__suggestion",
    );
    await expect(
      suggestions.filter({ hasText: "Alice Johnson" }),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  test("selecting autocomplete suggestion adds tag", async ({ page }) => {
    // Mock both endpoints since _fetchSuggestions uses Promise.all
    await page.route("**/api/categories/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: ["Nature", "Landscape", "City"],
        }),
      }),
    );
    await page.route("**/api/people/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ people: [] }),
      }),
    );

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    const catResponsePromise = page.waitForResponse("**/api/categories/");
    const pplResponsePromise = page.waitForResponse("**/api/people/");
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });
    await catResponsePromise;
    await pplResponsePromise;

    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.click();
    await categoryInput.pressSequentially("land");

    const suggestion = editor
      .locator(".pxme-editor__categories .pxme-editor__suggestion")
      .filter({ hasText: "Landscape" });
    await expect(suggestion).toBeVisible({ timeout: 5_000 });
    await suggestion.click();

    // Tag should appear
    const tags = editor.locator(".pxme-editor__categories .pxme-editor__tag");
    await expect(tags.filter({ hasText: "Landscape" })).toBeVisible({
      timeout: 5_000,
    });

    // Input should be cleared
    await expect(categoryInput).toHaveValue("");
  });

  test("gallery refreshes after save", async ({ page }) => {
    let galleryFetchCount = 0;

    await page.route("**/api/images/?**", (route) => {
      galleryFetchCount++;
      route.continue();
    });
    await page.route("**/api/images/", (route) => {
      galleryFetchCount++;
      route.continue();
    });

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

    const initialFetchCount = galleryFetchCount;

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
    await expect(
      editor
        .locator(".pxme-editor__categories .pxme-editor__tag")
        .filter({ hasText: "RefreshTest" }),
    ).toBeVisible({ timeout: 5_000 });

    // Click Save (not Close)
    const saveBtn = editor.locator(".pxme-editor__save-btn");
    await saveBtn.click();
    await expect(editor).not.toBeVisible({ timeout: 5_000 });

    // Wait for gallery to re-fetch
    await page.waitForTimeout(1_000);

    expect(galleryFetchCount).toBeGreaterThan(initialFetchCount);
  });

  test("gallery does not refresh when editor is cancelled", async ({
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

    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    // Close without saving (cancel)
    const cancelBtn = editor.locator(".pxme-editor__cancel-btn");
    await cancelBtn.click();
    await expect(editor).not.toBeVisible();

    await page.waitForTimeout(1_000);

    expect(galleryFetchCount).toBe(initialFetchCount);
  });

  test("adds a new category and confirms it appears after save", async ({
    page,
  }) => {
    const newCategory = "AcceptanceTestCat";
    let postRequest: { method: string; url: string } | null = null;
    let galleryLoadCount = 0;

    // Intercept POST to categories API — mock success
    await page.route("**/api/images/*/categories/*", (route) => {
      if (route.request().method() === "POST") {
        postRequest = {
          method: route.request().method(),
          url: route.request().url(),
        };
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    // Intercept gallery list requests — after the first load, inject
    // the new category into the first image to simulate backend persistence
    const injectCategory: Parameters<typeof page.route>[1] = async (route) => {
      galleryLoadCount++;
      if (galleryLoadCount <= 1) {
        route.continue();
        return;
      }
      const response = await route.fetch();
      const json = await response.json();
      if (json.images && json.images.length > 0) {
        const cats = json.images[0].categories || [];
        if (!cats.includes(newCategory)) {
          json.images[0].categories = [...cats, newCategory];
        }
      }
      route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    };

    await page.route("**/api/images/?**", injectCategory);
    await page.route("**/api/images/", injectCategory);

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Open editor on first image
    const firstEditBtn = gallery.locator(".pxme-edit-btn").first();
    await firstEditBtn.click();

    const editor = page.locator("pxme-image-editor");
    await expect(editor).toBeVisible({ timeout: 5_000 });

    // Add the new category
    const categoryInput = editor.locator(
      ".pxme-editor__categories .pxme-editor__input",
    );
    await categoryInput.fill(newCategory);
    const addBtn = editor.locator(
      ".pxme-editor__categories .pxme-editor__add-btn",
    );
    await addBtn.click();

    // Verify tag appears in editor
    await expect(
      editor
        .locator(".pxme-editor__categories .pxme-editor__tag")
        .filter({ hasText: newCategory }),
    ).toBeVisible({ timeout: 5_000 });

    // Click Save
    const saveBtn = editor.locator(".pxme-editor__save-btn");
    await saveBtn.click();

    // Verify editor closes
    await expect(editor).not.toBeVisible({ timeout: 5_000 });

    // Verify POST was sent to the correct endpoint
    expect(postRequest).toBeTruthy();
    expect(postRequest!.method).toBe("POST");
    expect(postRequest!.url).toContain(
      `/categories/${encodeURIComponent(newCategory)}`,
    );

    // Wait for gallery to refresh with injected data
    await page.waitForTimeout(1_000);

    // Reopen editor on first image
    const editBtnAfterRefresh = gallery.locator(".pxme-edit-btn").first();
    await editBtnAfterRefresh.click();

    const editorAfterRefresh = page.locator("pxme-image-editor");
    await expect(editorAfterRefresh).toBeVisible({ timeout: 5_000 });

    // Confirm the new category persists in the editor
    await expect(
      editorAfterRefresh
        .locator(".pxme-editor__categories .pxme-editor__tag")
        .filter({ hasText: newCategory }),
    ).toBeVisible({ timeout: 5_000 });
  });
});
