import { test, expect } from "@playwright/test";

test.describe("API health", () => {
  test("BFF health endpoint responds", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.status()).toBe(200);
  });

  test("BFF ready endpoint responds", async ({ request }) => {
    const response = await request.get("/ready");
    expect(response.status()).toBe(200);
  });

  test("version endpoint returns all service versions", async ({ request }) => {
    const response = await request.get("/version");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("bff");
    expect(data).toHaveProperty("api");
    expect(data).toHaveProperty("gateway");
    expect(data).toHaveProperty("facerecognition");
    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("acceptance");
    expect(data).toHaveProperty("deepface");
    expect(data).toHaveProperty("static");
  });
});

test.describe("Images API", () => {
  test("returns images list", async ({ request }) => {
    const response = await request.get("/api/images/?limit=5");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("images");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("count");
    expect(data.images.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(100);
  });

  test("supports pagination", async ({ request }) => {
    const page1 = await request.get("/api/images/?limit=2&offset=0");
    const page2 = await request.get("/api/images/?limit=2&offset=2");
    expect(page1.status()).toBe(200);
    expect(page2.status()).toBe(200);
    const data1 = await page1.json();
    const data2 = await page2.json();
    // Different images on different pages
    expect(data1.images[0].id).not.toBe(data2.images[0].id);
  });

  test("supports category filter", async ({ request }) => {
    const response = await request.get("/api/images/?category=outdoor&limit=5");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("images");
    expect(data).toHaveProperty("total");
    // outdoor is a known category with images
    expect(data.total).toBeGreaterThan(0);
  });

  test("supports person filter", async ({ request }) => {
    // Get the first person from the people endpoint
    const peopleRes = await request.get("/api/people/");
    const peopleData = await peopleRes.json();

    if (peopleData.people && peopleData.people.length > 0) {
      const personName = peopleData.people[0].name || peopleData.people[0];
      const response = await request.get(
        `/api/images/?person=${encodeURIComponent(personName)}&limit=5`,
      );
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("images");
    }
  });

  test("image objects have expected fields", async ({ request }) => {
    const response = await request.get("/api/images/?limit=1");
    const data = await response.json();
    const image = data.images[0];
    expect(image).toHaveProperty("id");
    expect(image).toHaveProperty("name");
    expect(image).toHaveProperty("uri");
  });
});

test.describe("Categories API", () => {
  test("returns categories list", async ({ request }) => {
    const response = await request.get("/api/categories/");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("categories");
    expect(data.categories.length).toBeGreaterThanOrEqual(20);
  });

  test("categories are lowercase", async ({ request }) => {
    const response = await request.get("/api/categories/");
    const data = await response.json();
    for (const category of data.categories) {
      expect(category).toBe(category.toLowerCase());
    }
  });

  test("contains known canonical categories", async ({ request }) => {
    const response = await request.get("/api/categories/");
    const data = await response.json();
    const categories = data.categories as string[];
    expect(categories).toContain("outdoor");
    expect(categories).toContain("portrait");
    expect(categories).toContain("nature");
    expect(categories).toContain("animals");
  });
});

test.describe("People API", () => {
  test("returns people list", async ({ request }) => {
    const response = await request.get("/api/people/");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("people");
  });
});

test.describe("HTTPS redirect", () => {
  test("HTTP redirects to HTTPS", async ({ request }) => {
    // Construct an HTTP URL from the base
    const baseUrl = process.env.BASE_URL || "https://pixme.wattu.com";
    const httpUrl = baseUrl.replace("https://", "http://");

    const response = await request.get(httpUrl, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    // Should be 301 or 308 redirect
    expect([301, 308]).toContain(response.status());
    const location = response.headers()["location"];
    expect(location).toContain("https://");
  });
});
