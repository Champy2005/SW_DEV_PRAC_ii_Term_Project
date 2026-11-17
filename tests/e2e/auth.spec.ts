import { expect, test, type Page } from "@playwright/test";

const demoPassword = "WorkshopDemo123!";
const memberEmail = "member@workshop.local";
const signupEndpoint = "/api/backend/auth/register";
const loginEndpoint = "/api/backend/auth/login";

interface SignupFields {
  email: string;
  name?: string;
  telephone?: string;
  role?: "member" | "admin";
}

async function fillSignup(page: Page, fields: SignupFields) {
  await page.getByLabel("Your name", { exact: true }).fill(fields.name ?? "Account Review");
  await page.getByLabel("Email address", { exact: true }).fill(fields.email);
  await page.getByLabel("Phone number", { exact: true }).fill(fields.telephone ?? "0812345678");
  await page.getByLabel("Account role", { exact: true }).selectOption(fields.role ?? "member");
  await page.getByLabel("Password", { exact: true }).fill(demoPassword);
}

async function expectNoSession(page: Page) {
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name === "workshop_session")).toBe(false);

  const profile = await page.request.get("/api/backend/auth/me");
  expect(profile.status()).toBe(401);
}

test.describe("WR-002: readable and reliable accounts", () => {
  test("blank signup uses native required-field validation without sending a request", async ({ page }) => {
    let signupRequests = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).pathname === signupEndpoint) {
        signupRequests += 1;
      }
    });

    await page.goto("/register");
    await page.getByRole("button", { name: "Create account", exact: true }).click();

    for (const label of ["Your name", "Email address", "Phone number", "Password"]) {
      const valueMissing = await page.getByLabel(label, { exact: true }).evaluate((element) => {
        return (element as HTMLInputElement).validity.valueMissing;
      });
      expect(valueMissing, `${label} should require a value`).toBe(true);
    }

    await expect(page).toHaveURL(/\/register$/);
    expect(signupRequests).toBe(0);
    await expectNoSession(page);
  });

  for (const invalidField of [
    { label: "name", fields: { name: "   " }, message: /name|required/i },
    { label: "telephone", fields: { telephone: "   " }, message: /phone|telephone|required/i },
  ]) {
    test(`whitespace-only ${invalidField.label} explains the problem without sending signup`, async ({ page }) => {
      let signupRequests = 0;
      page.on("request", (request) => {
        if (request.method() === "POST" && new URL(request.url()).pathname === signupEndpoint) {
          signupRequests += 1;
        }
      });

      await page.goto("/register");
      await fillSignup(page, {
        email: `whitespace-${invalidField.label}-${Date.now()}@example.com`,
        ...invalidField.fields,
      });
      await page.getByRole("button", { name: "Create account", exact: true }).click();

      await expect(page.getByRole("main").getByRole("alert")).toContainText(invalidField.message);
      await expect(page).toHaveURL(/\/register$/);
      expect(signupRequests).toBe(0);
      await expectNoSession(page);
    });
  }

  test("wrong password leaves no session and a corrected password can be retried", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address", { exact: true }).fill(memberEmail);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword123!");

    const [rejected] = await Promise.all([
      page.waitForResponse((response) => {
        return response.request().method() === "POST"
          && new URL(response.url()).pathname === loginEndpoint;
      }),
      page.getByRole("button", { name: "Welcome back", exact: true }).click(),
    ]);

    expect(rejected.status()).toBe(401);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(/invalid credentials/i);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(memberEmail);
    await expectNoSession(page);

    await page.getByLabel("Password", { exact: true }).fill(demoPassword);
    await page.getByRole("button", { name: "Welcome back", exact: true }).click();

    await expect(page).toHaveURL(/\/registrations$/);
    await expect(page.getByRole("link", { name: "My registrations", exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });

  test("duplicate email shows a helpful error without establishing a session", async ({ page }) => {
    await page.goto("/register");
    await fillSignup(page, { email: memberEmail });

    const [rejected] = await Promise.all([
      page.waitForResponse((response) => {
        return response.request().method() === "POST"
          && new URL(response.url()).pathname === signupEndpoint;
      }),
      page.getByRole("button", { name: "Create account", exact: true }).click(),
    ]);

    expect(rejected.status()).toBe(409);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(/email.*already registered/i);
    await expect(page).toHaveURL(/\/register$/);
    await expectNoSession(page);
  });

  test("administrator signup shows admin navigation and survives a reload", async ({ page }) => {
    await page.goto("/register");
    await fillSignup(page, {
      name: "Browser Administrator",
      email: `admin-signup-${Date.now()}@example.com`,
      role: "admin",
    });
    await page.getByRole("button", { name: "Create account", exact: true }).click();

    await expect(page).toHaveURL(/\/registrations$/);
    await expect(page.getByRole("heading", { name: "All registrations.", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage workshops", exact: true })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { name: "All registrations.", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Manage workshops", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/workshops$/);
    await expect(page.getByRole("button", { name: "+ Create workshop", exact: true })).toBeVisible();
  });
});
