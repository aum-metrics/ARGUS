
import { test, expect } from '@playwright/test';

test('UAT-01: Institutional Registration UI Flow', async ({ page }) => {
    // 1. Navigate to Registration
    await page.goto('http://localhost:3000/register/organization');
    // Check for the main heading instead of title
    await expect(page.locator('h1')).toContainText('Institutional Access');

    // 2. Validate Tier Selection
    // Click the label for Lab Starter
    await page.click('label[for="lab"]');
    // Verify the Pay Button updates/shows the correct amount
    await expect(page.locator('button:has-text("Pay $299")')).toBeVisible();

    // Switch to Department and verify update
    await page.click('label[for="department"]');
    await expect(page.locator('button:has-text("Pay $1,499")')).toBeVisible();

    // Switch back to Lab for submission
    await page.click('label[for="lab"]');

    // 3. Form Interaction (Validation)
    await page.click('button:has-text("Pay $299")');
    // Should see validation errors (browser default or UI) - assuming UI validation prevents submission
    // We'll just fill it now
    await page.fill('input[placeholder="e.g. Stanford AI Lab"]', 'UAT Test Lab');
    await page.fill('input[placeholder="e.g. Dr. Jane Doe"]', 'UAT Tester');
    await page.fill('input[type="email"]', 'uat@argus.test');
    await page.fill('input[type="tel"]', '1234567890');

    // 4. Verify API Trigger on Click
    // We intercept the network request to ensure the backend order creation is called
    const orderRequestPromise = page.waitForRequest(request =>
        request.url().includes('/api/create-razorpay-order') && request.method() === 'POST'
    );

    await page.click('button:has-text("Proceed to Payment")');

    const request = await orderRequestPromise;
    expect(request.postDataJSON()).toMatchObject({
        amount: 29900,
        currency: 'USD'
    });

    console.log("✅ UAT-01 Passed: UI Flow Correct & API Triggered");
});
