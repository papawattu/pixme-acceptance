import { test, expect } from "@playwright/test";

const authenticatedSession = {
  user: {
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.png",
    role: "admin",
  },
  expires: "2099-12-31T23:59:59.000Z",
};

test.describe("SSE — unauthenticated", () => {
  test("does not connect to /api/stream when unauthenticated", async ({
    page,
  }) => {
    let streamRequested = false;

    await page.route("**/api/stream", (route) => {
      streamRequested = true;
      route.abort();
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Give time for any async SSE connection to be attempted
    await page.waitForTimeout(2_000);
    expect(streamRequested).toBe(false);
  });
});

test.describe("SSE — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authenticatedSession),
      }),
    );
  });

  test("connects to /api/stream when authenticated", async ({ page }) => {
    let streamRequested = false;

    await page.route("**/api/stream", (route) => {
      streamRequested = true;
      // Fulfill with a valid SSE response that sends a ping and stays open
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: "data: ping\n\n",
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Wait for SSE connection to be established
    await expect
      .poll(() => streamRequested, { timeout: 10_000 })
      .toBe(true);
  });

  test("auto-refreshes gallery when image_saved event is received", async ({
    page,
  }) => {
    let galleryFetchCount = 0;

    // Track gallery list requests
    await page.route("**/api/images/?**", (route) => {
      galleryFetchCount++;
      route.continue();
    });
    await page.route("**/api/images/", (route) => {
      galleryFetchCount++;
      route.continue();
    });

    // Mock SSE endpoint — send image_saved event
    await page.route("**/api/stream", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: "data: image_saved\n\n",
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialFetchCount = galleryFetchCount;

    // Wait for the SSE-triggered refresh
    await expect
      .poll(() => galleryFetchCount, { timeout: 10_000 })
      .toBeGreaterThan(initialFetchCount);
  });

  test("fetches single image when image_updated:<id> event is received", async ({
    page,
  }) => {
    const testImageId = "test-image-id-abc123";
    let galleryReloadCount = 0;

    // Mock SSE endpoint — send image_updated:<id> event
    await page.route("**/api/stream", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: `data: image_updated:${testImageId}\n\n`,
      });
    });

    // Intercept single-image fetch and fulfill it
    await page.route(`**/api/images/${testImageId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: testImageId,
          name: "Updated Image",
          title: "Updated Image",
          description: "Updated description",
          uri: "/images/test.jpg",
          thumbnailUri: "/thumbnails/test_thumbnail.jpg",
          categories: ["updated"],
          people: [],
        }),
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    // Now track gallery list reloads AFTER initial load
    await page.route("**/api/images/?*", (route) => {
      galleryReloadCount++;
      route.continue();
    });

    // Wait for the targeted single-image fetch (triggered by SSE)
    const singleImageRequest = await page.waitForRequest(
      (req) => req.url().includes(`/api/images/${testImageId}`),
      { timeout: 15_000 },
    );

    expect(singleImageRequest.url()).toContain(`/api/images/${testImageId}`);

    // Confirm no full gallery reload was triggered by the SSE event
    await page.waitForTimeout(1_000);
    expect(galleryReloadCount).toBe(0);
  });

  test("auto-refreshes gallery when image_deleted event is received", async ({
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

    await page.route("**/api/stream", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: "data: image_deleted\n\n",
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialFetchCount = galleryFetchCount;

    await expect
      .poll(() => galleryFetchCount, { timeout: 10_000 })
      .toBeGreaterThan(initialFetchCount);
  });

  test("falls back to full gallery reload for legacy image_updated event", async ({
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

    // Send legacy format (no image ID)
    await page.route("**/api/stream", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: "data: image_updated\n\n",
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialFetchCount = galleryFetchCount;

    await expect
      .poll(() => galleryFetchCount, { timeout: 10_000 })
      .toBeGreaterThan(initialFetchCount);
  });

  test("does not refresh gallery on ping events", async ({ page }) => {
    let galleryFetchCount = 0;

    await page.route("**/api/images/?**", (route) => {
      galleryFetchCount++;
      route.continue();
    });
    await page.route("**/api/images/", (route) => {
      galleryFetchCount++;
      route.continue();
    });

    await page.route("**/api/stream", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: "data: ping\n\n",
      });
    });

    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialFetchCount = galleryFetchCount;

    // Wait a bit — no refresh should happen from a ping
    await page.waitForTimeout(3_000);
    expect(galleryFetchCount).toBe(initialFetchCount);
  });
});
