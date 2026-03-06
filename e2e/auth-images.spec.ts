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

test.describe("Image access control — unauthenticated", () => {
  test("landing page does not reveal gallery images", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("pxme-hero")).toContainText(
      "A private home for the moments that matter.",
    );
    await expect(page.locator("pxme-hero")).toContainText(
      "Sign in to continue",
    );
    await expect(page.locator("pxme-gallery")).not.toBeVisible();
    await expect(page.locator("img[src*='/thumbnails/']")).toHaveCount(0);
    await expect(page.locator("a[href*='/view.html?img=']")).toHaveCount(0);
  });

  test("single-image view does not reveal protected image content", async ({
    page,
  }) => {
    await page.goto("/view.html?img=%2Fimages%2Fprotected.jpg");

    await expect(page.locator("pxme-viewer")).not.toBeVisible();
    await expect(page.locator("img[src*='/images/']")).toHaveCount(0);
  });

  test("image APIs reject anonymous access", async ({ request }) => {
    const listResponse = await request.get("/api/images/");
    expect([401, 403]).toContain(listResponse.status());

    const imageResponse = await request.get("/api/images/test-image-id");
    expect([401, 403]).toContain(imageResponse.status());
  });

  test("raw image and thumbnail URLs reject anonymous access", async ({
    request,
  }) => {
    const imageResponse = await request.get("/images/protected.jpg", {
      maxRedirects: 0,
    });
    expect([401, 403, 302, 307, 308]).toContain(imageResponse.status());

    const thumbnailResponse = await request.get(
      "/thumbnails/protected_thumbnail.jpg",
      { maxRedirects: 0 },
    );
    expect([401, 403, 302, 307, 308]).toContain(thumbnailResponse.status());
  });
});

test.describe("Image access control — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authenticatedSession),
      }),
    );
  });

  test("authenticated users still see gallery items", async ({ page }) => {
    await page.goto("/");

    const gallery = page.locator("pxme-gallery");
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("authenticated users can open the viewer page", async ({ page }) => {
    await page.goto("/");

    const firstImage = page.locator("pxme-gallery .pxme-gallery__link").first();
    await expect(firstImage).toBeVisible({ timeout: 15_000 });
    await firstImage.click();

    await expect(page).toHaveURL(/\/view\.html\?img=/);
  });
});
