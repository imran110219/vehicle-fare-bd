import { test, expect } from "@playwright/test";

test("drop pins update distance", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".map-container")).toHaveCount(2);
  await page.locator(".maplibregl-canvas").first().waitFor({ timeout: 10000 });

  const maps = page.locator(".map-container");
  await maps.nth(0).click({ position: { x: 120, y: 120 } });
  await maps.nth(1).click({ position: { x: 160, y: 160 } });

  await page.getByRole("button", { name: /estimate fare/i }).click();

  const distanceInput = page.locator("input[placeholder='Auto from map']");
  await expect(distanceInput).toHaveValue(/\d/);
});
