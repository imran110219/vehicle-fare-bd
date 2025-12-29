import { test, expect } from "@playwright/test";

test("estimate -> login -> submit report -> profile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /estimate fare/i }).click();

  const email = `test+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.fill("input[name='name']", "Test User");
  await page.fill("input[name='email']", email);
  await page.fill("input[name='password']", "password123");
  await page.getByRole("button", { name: /create account/i }).click();

  await page.goto("/login");
  await page.fill("input[type='email']", email);
  await page.fill("input[type='password']", "password123");
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.goto("/report");
  await page.fill("input[name='pickupArea']", "Dhanmondi");
  await page.fill("input[name='dropArea']", "Gulshan");
  await page.fill("input[name='distanceKm']", "4.2");
  await page.fill("input[name='farePaid']", "120");
  await page.getByRole("button", { name: /submit report/i }).click();

  await page.goto("/profile");
  await expect(page.getByText("Dhanmondi")).toBeVisible();
});
