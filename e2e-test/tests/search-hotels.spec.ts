import { test, expect } from "@playwright/test";
import path from "path";

const UI_URL = "http://localhost:5173/";

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);

  // get sign in button
  await page.getByRole("link", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.locator("[name=email]").fill("test_register@tes.com");
  await page.locator("[name=password]").fill("pass1234");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Sign in Successfull")).toBeVisible();
});

test("Should show hotel search results", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Oni");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Hotels found in Oni")).toBeVisible();
  await expect(page.getByText("Grand showi")).toBeVisible();
});

test("Should show hotel detail", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Oni");
  await page.getByRole("button", { name: "Search" }).click();

  await page.getByText("Grand showi").click();
  await expect(page).toHaveURL(/detail/);
  await expect(page.getByRole("button", { name: "Book now" })).toBeVisible();
});

test("should book hotel", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Oni");
  const date = new Date();
  date.setDate(date.getDate() + 3);
  const formattedDate = date.toISOString().split("T")[0];
  await page.getByPlaceholder("Check-out Date").fill(formattedDate);

  await page.getByRole("button", { name: "Search" }).click();

  await page.getByText("Grand showi").click();
  await page.getByRole("button", { name: "Book now" }).click();

  await expect(page.getByText("Total Cost : $296.00")).toBeVisible();

  const stripeFrame = page.frameLocator("iframe").first();
  await stripeFrame
    .locator('[placeholder="Card number"]')
    .fill("4242424242424242");
  await stripeFrame.locator("[placeholder='MM / YY']").fill("07/31");
  await stripeFrame.locator("[placeholder='CVC']").fill("117");
  await stripeFrame.locator("[placeholder='ZIP']").fill("11745");
  await page.getByRole("button", { name: "Confirm Booking" }).click();
  await expect(page.getByText("Booking saved")).toBeVisible();

  await page.getByRole("link", { name: "My Bookings" }).click();
  await expect(page.getByText("Grand showi")).toBeVisible();
});