import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
test.describe("Login page", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows error with wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "nonexistent@example.com");
    await page.fill("input[type='password']", "wrongpassword123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid|error|incorrect|failed/i)).toBeVisible();
  });

  test("has a link to the register page", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: /register|create account|sign up/i });
    await expect(link).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Register page
// ---------------------------------------------------------------------------
test.describe("Register page", () => {
  test("renders registration form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows validation error when name is too short", async ({ page }) => {
    await page.goto("/register");
    await page.fill("input[name='name']", "A");
    await page.fill("input[name='email']", "valid@example.com");
    await page.fill("input[name='password']", "password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/name|characters|short/i)).toBeVisible();
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/register");
    await page.fill("input[name='name']", "Valid Name");
    await page.fill("input[name='email']", "not-an-email");
    await page.fill("input[name='password']", "password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/email|invalid/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
test.describe("Protected routes", () => {
  test("unauthenticated user sees sign-in prompt on /report", async ({ page }) => {
    await page.goto("/report");

    const url = page.url();
    const bodyText = (await page.textContent("body")) ?? "";

    // Either redirected to /login or shown a sign-in prompt
    expect(
      url.includes("/login") || bodyText.toLowerCase().includes("sign in")
    ).toBe(true);
  });

  test("unauthenticated user sees sign-in prompt on /profile", async ({ page }) => {
    await page.goto("/profile");

    const url = page.url();
    const bodyText = (await page.textContent("body")) ?? "";

    expect(
      url.includes("/login") || bodyText.toLowerCase().includes("sign in")
    ).toBe(true);
  });
});
